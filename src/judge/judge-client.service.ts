import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import crypto from "crypto";
import { Redis } from "ioredis";
import { Repository } from "typeorm";

import { format } from "@/common/utils/format";
import { RedisService } from "@/redis/redis.service";

import { JudgeClientEntity } from "./judge-client.entity";
import { IJudgeClientInfo, IJudgeClientSystemInfo } from "./judge-client.type";

const JUDGE_CLIENT_KEY_BYTE_LENGTH = 30;

function generateKey(): string {
    return crypto.randomBytes(JUDGE_CLIENT_KEY_BYTE_LENGTH).toString("base64");
}

const REDIS_KEY_JUDGE_CLIENT_SESSION_ID = "judge-client-session-id:{0}";
const REDIS_KEY_JUDGE_CLIENT_SYSTEM_INFO = "judge-client-system-info:{0}";

@Injectable()
export class JudgeClientService {
    private readonly redis: Redis;

    constructor(
        @InjectRepository(JudgeClientEntity)
        private readonly judgeClientRepository: Repository<JudgeClientEntity>,
        private readonly redisService: RedisService,
    ) {
        this.redis = this.redisService.getClient();
    }

    public async findJudgeClientByIdAsync(id: number): Promise<JudgeClientEntity | null> {
        return await this.judgeClientRepository.findOneBy({ id });
    }

    public async findJudgeClientByKeyAsync(key: string): Promise<JudgeClientEntity | null> {
        return await this.judgeClientRepository.findOneBy({ key });
    }

    public async listJudgeClientsAsync(): Promise<JudgeClientEntity[]> {
        return await this.judgeClientRepository.find();
    }

    public async getJudgeClientInfoAsync(
        judgeClient: JudgeClientEntity,
        showSensitive = false,
    ): Promise<IJudgeClientInfo> {
        return {
            id: judgeClient.id,
            name: judgeClient.name,
            key: !showSensitive ? null : judgeClient.key,
            allowedHosts: !showSensitive ? null : judgeClient.allowedHosts,
            online: await this.isJudgeClientOnlineAsync(judgeClient),
            systemInfo: await this.getJudgeClientSystemInfoAsync(judgeClient),
        };
    }

    public async addJudgeClientAsync(name: string, allowedHosts: string[]): Promise<JudgeClientEntity> {
        const judgeClient = new JudgeClientEntity();
        judgeClient.name = name;
        judgeClient.key = generateKey();
        judgeClient.allowedHosts = allowedHosts;
        await this.judgeClientRepository.save(judgeClient);

        return judgeClient;
    }

    public async resetJudgeClientKeyAsync(judgeClient: JudgeClientEntity): Promise<void> {
        judgeClient.key = generateKey();
        await this.judgeClientRepository.save(judgeClient);
        await this.disconnectJudgeClientAsync(judgeClient);
    }

    public async deleteJudgeClientAsync(judgeClient: JudgeClientEntity): Promise<void> {
        await this.judgeClientRepository.delete({
            id: judgeClient.id,
        });
        await this.disconnectJudgeClientAsync(judgeClient);
    }

    public async setJudgeClientOnlineSessionIdAsync(judgeClient: JudgeClientEntity, sessionId: string): Promise<void> {
        await this.redis.set(format(REDIS_KEY_JUDGE_CLIENT_SESSION_ID, judgeClient.id), sessionId);
    }

    public async disconnectJudgeClientAsync(judgeClient: JudgeClientEntity): Promise<void> {
        await this.redis.del(format(REDIS_KEY_JUDGE_CLIENT_SESSION_ID, judgeClient.id));
    }

    public async checkJudgeClientSessionAsync(judgeClient: JudgeClientEntity, sessionId: string): Promise<boolean> {
        return sessionId === (await this.redis.get(format(REDIS_KEY_JUDGE_CLIENT_SESSION_ID, judgeClient.id)));
    }

    public async updateJudgeClientSystemInfoAsync(
        judgeClient: JudgeClientEntity,
        systemInfo: IJudgeClientSystemInfo,
    ): Promise<void> {
        await this.redis.set(format(REDIS_KEY_JUDGE_CLIENT_SYSTEM_INFO, judgeClient.id), JSON.stringify(systemInfo));
    }

    public async getJudgeClientSystemInfoAsync(judgeClient: JudgeClientEntity): Promise<IJudgeClientSystemInfo | null> {
        const str = await this.redis.get(format(REDIS_KEY_JUDGE_CLIENT_SYSTEM_INFO, judgeClient.id));
        try {
            return str && JSON.parse(str);
        } catch {
            return null;
        }
    }

    public async isJudgeClientOnlineAsync(judgeClient: JudgeClientEntity): Promise<boolean> {
        return !!(await this.redis.get(format(REDIS_KEY_JUDGE_CLIENT_SESSION_ID, judgeClient.id)));
    }
}
