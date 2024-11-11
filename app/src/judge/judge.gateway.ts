import { Logger } from "@nestjs/common";
import {
    ConnectedSocket,
    MessageBody,
    OnGatewayConnection,
    OnGatewayDisconnect,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
} from "@nestjs/websockets";
import Redis from "ioredis";
import proxyAddr from "proxy-addr";
import { Server, Socket } from "socket.io";
import SocketIOParser from "socket.io-msgpack-parser";

import { format } from "@/common/utils/format";
import { ConfigService } from "@/config/config.service";
import { FileService } from "@/file/file.service";
import { LockService } from "@/redis/lock.service";
import { RedisService } from "@/redis/redis.service";
import { ISubmissionProgressMessage } from "@/submission/submission.type";

import { JudgeClientService } from "./judge-client.service";
import { IJudgeClientState, IJudgeClientSystemInfo } from "./judge-client.type";
import { JudgeQueueService } from "./judge-queue.service";

const REDIS_KEY_JUDGE_CLIENT_TEMPORARILY_DISCONNECTED = "judge-client-temporarily-disconnected:{0}";
const JUDGE_CLIENT_TEMPORARILY_DISCONNECTED_MAX_TIME = 60;

const REDIS_LOCK_JUDGE_CLIENT_CONNECT_DISCONNECT = "judge-client-connect-disconnect:{0}";

const REDIS_CHANNEL_CANCEL_TASK = "cancel-task";

@WebSocketGateway({
    maxHttpBufferSize: 1e9,
    namespace: "judge",
    path: "/api/socket",
    transports: ["websocket"],
    parser: SocketIOParser,
})
export class JudgeGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    private server: Server;

    private mapSessionIdToJudgeClient: Map<string, IJudgeClientState> = new Map();

    private mapTaskIdToSocket: Map<string, Socket> = new Map();

    private redis: Redis;

    // To subscribe the "cancel task" event
    private redisForSubscribe: Redis;

    constructor(
        private readonly judgeClientService: JudgeClientService,
        private readonly judgeQueueService: JudgeQueueService,
        private readonly fileService: FileService,
        private readonly configService: ConfigService,
        private readonly redisService: RedisService,
        private readonly lockService: LockService,
    ) {
        this.redis = this.redisService.getClient();

        this.redisForSubscribe = this.redisService.getClient();

        this.redisForSubscribe.on("message", (channel: string, message: string) => {
            this.onCancelTask(message);
        });
        this.redisForSubscribe.subscribe(REDIS_CHANNEL_CANCEL_TASK);
    }

    // Send the cancel task operation to ALL nodes
    public cancelTask(taskId: string) {
        this.redis.publish(REDIS_CHANNEL_CANCEL_TASK, taskId);
    }

    public onCancelTask(taskId: string): void {
        const client = this.mapTaskIdToSocket.get(taskId);
        if (!client) return;

        client.emit("cancel", taskId);
    }

    private async checkConnectionAsync(client: Socket): Promise<boolean> {
        if (!client.connected) return false;

        const judgeClientState = this.mapSessionIdToJudgeClient.get(client.id);

        if (
            !judgeClientState ||
            !(await this.judgeClientService.checkJudgeClientSessionAsync(judgeClientState.judgeClient, client.id))
        ) {
            client.disconnect(true);
            return false;
        }
        return true;
    }

    // eslint-disable-next-line @typescript-eslint/naming-convention
    public async handleConnection(client: Socket): Promise<void> {
        const key = (client.handshake.query.key as string).split(" ").pop() || "";
        const judgeClient = await this.judgeClientService.findJudgeClientByKeyAsync(key);

        if (!judgeClient) {
            Logger.verbose(`Client ${client.id} connected with invalid key`);
            client.emit("authenticationFailed");
            // Delay the disconnection to make the authenticationFailed event able to be sent to the client
            setImmediate(() => client.disconnect(true));
            return;
        }

        // Maybe the socket "disconnect" event is emitted before the query finished
        if (!client.connected) return;

        await this.lockService.lockAsync(
            format(REDIS_LOCK_JUDGE_CLIENT_CONNECT_DISCONNECT, judgeClient.id),
            async () => {
                await this.judgeClientService.setJudgeClientOnlineSessionIdAsync(judgeClient, client.id);

                if (!client.connected) {
                    await this.judgeClientService.disconnectJudgeClientAsync(judgeClient);
                }

                this.mapSessionIdToJudgeClient.set(client.id, {
                    judgeClient,
                    pendingTasks: new Set(),
                });
            },
        );

        if (!client.connected) {
            return;
        }

        // Now we are ready for consuming task
        client.emit("ready", judgeClient.name, this.configService.config.judge);

        Logger.log(
            `Judge client ${client.id} (${judgeClient.name}) connected from ${proxyAddr(
                client.request,
                this.configService.config.server.trustProxy,
            )}.`,
        );

        await this.redis.del(format(REDIS_KEY_JUDGE_CLIENT_TEMPORARILY_DISCONNECTED, judgeClient.id));
    }

    // eslint-disable-next-line @typescript-eslint/naming-convention
    public async handleDisconnect(client: Socket): Promise<void> {
        const state = this.mapSessionIdToJudgeClient.get(client.id);
        if (!state) {
            Logger.log(`Judge client ${client.id} disconnected before initialized, ignoring`);
            return; // Initialization has not been completed
        }

        Logger.log(`Judge client ${client.id} (${state.judgeClient.name}) disconnected.`);

        this.mapSessionIdToJudgeClient.delete(client.id);

        // Another "connect" may be fired before the disconnect event
        // So directly call "disconnectJudgeClient" will disconnect the newly connected client
        await this.lockService.lockAsync(
            format(REDIS_LOCK_JUDGE_CLIENT_CONNECT_DISCONNECT, state.judgeClient.id),
            async () => {
                // Ensure if this session holds the client
                if (await this.judgeClientService.checkJudgeClientSessionAsync(state.judgeClient, client.id)) {
                    await this.judgeClientService.disconnectJudgeClientAsync(state.judgeClient);
                }
            },
        );

        if (state.pendingTasks.size !== 0) {
            Logger.log(
                `Re-pushing ${state.pendingTasks.size} tasks consumed by judge client ${client.id} (${state.judgeClient.name}).`,
            );
            // Push the pending tasks back to the queue
            await Promise.all(
                Array.from(state.pendingTasks.values()).map(async (task) => {
                    this.mapTaskIdToSocket.delete(task.taskId);
                    await this.judgeQueueService.pushTaskAsync(task.taskId, task.priority, true);
                }),
            );
        }

        // Report event
        await this.redis.setex(
            format(REDIS_KEY_JUDGE_CLIENT_TEMPORARILY_DISCONNECTED, state.judgeClient.id),
            JUDGE_CLIENT_TEMPORARILY_DISCONNECTED_MAX_TIME,
            "1",
        );
    }

    @SubscribeMessage("systemInfo")
    public async onSystemInfoAsync(
        @ConnectedSocket() client: Socket,
        @MessageBody() systemInfo: IJudgeClientSystemInfo,
    ): Promise<void> {
        const state = this.mapSessionIdToJudgeClient.get(client.id);
        if (!state) {
            Logger.warn(`"systemInfo" emitted from an unknown client ${client.id}, ignoring`);
            return;
        }

        await this.judgeClientService.updateJudgeClientSystemInfoAsync(state.judgeClient, systemInfo);
    }

    @SubscribeMessage("requestFiles")
    public async onRequestFilesAsync(
        @ConnectedSocket() client: Socket,
        @MessageBody() fileUuids: string[],
    ): Promise<string[]> {
        const state = this.mapSessionIdToJudgeClient.get(client.id);
        if (!state) {
            Logger.warn(`"requestFiles" emitted from an unknown client ${client.id}, ignoring`);
            return [];
        }

        Logger.log(`Judge client ${client.id} (${state.judgeClient.name}) requested ${fileUuids.length} files`);
        return await Promise.all(
            fileUuids.map(async (fileUuid) => await this.fileService.signDownloadUrlAsync(fileUuid)),
        );
    }

    @SubscribeMessage("consumeTask")
    public async onConsumeTaskAsync(@ConnectedSocket() client: Socket, @MessageBody() threadId: number): Promise<void> {
        const state = this.mapSessionIdToJudgeClient.get(client.id);
        if (!state) {
            Logger.warn(`"consumeTask" emitted from an unknown client ${client.id}, ignoring`);
            return;
        }

        while (await this.checkConnectionAsync(client)) {
            const task = await this.judgeQueueService.consumeTaskAsync();
            if (!task) continue;

            if (!(await this.checkConnectionAsync(client))) {
                Logger.verbose(
                    `Consumed task for client ${client.id} (${state.judgeClient.name}), but connection became invalid, re-pushing task back to queue`,
                );
                await this.judgeQueueService.pushTaskAsync(task.taskId, task.priority, true);
            }

            state.pendingTasks.add(task);
            this.mapTaskIdToSocket.set(task.taskId, client);
            client.emit("task", threadId, task, () => {
                Logger.verbose(
                    `Judge client ${client.id} (${state.judgeClient.name}) acknowledged task ${task.taskId}`,
                );
                state.pendingTasks.delete(task);
                this.mapTaskIdToSocket.delete(task.taskId);
            });

            return;
        }
    }

    @SubscribeMessage("progress")
    public async onProgressAsync(
        @ConnectedSocket() client: Socket,
        @MessageBody() message: ISubmissionProgressMessage,
    ): Promise<void> {
        const state = this.mapSessionIdToJudgeClient.get(client.id);
        if (!state) {
            Logger.warn(`"progress" emitted from an unknown client ${client.id}, ignoring`);
            return;
        }

        const notCanceled = await this.judgeQueueService.onTaskProgressAsync(message.taskMeta.taskId, message.progress);
        if (!notCanceled) {
            Logger.log(`Emitting cancel event for task ${message.taskMeta.taskId}`);
            client.emit("cancel", message.taskMeta.taskId);
        }
    }
}
