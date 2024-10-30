import { forwardRef, Inject, Injectable, Logger } from "@nestjs/common";
import Redis from "ioredis";

import { RedisService } from "@/redis/redis.service";
import { SubmissionService } from "@/submission/submission.service";
import { ISubmissionProgress } from "@/submission/submission.type";

import { E_JudgeTaskPriorityType } from "./judge.enum";
import { IJudgeTask } from "./judge.type";

const REDIS_KEY_JUDGE_QUEUE = "judge-queue";
const REDIS_CONSUME_TIMEOUT = 10;

@Injectable()
export class JudgeQueueService {
    private readonly redisForPush: Redis;

    private readonly redisForConsume: Redis;

    constructor(
        @Inject(forwardRef(() => SubmissionService))
        private readonly submissionService: SubmissionService,
        private readonly redisService: RedisService,
    ) {
        this.redisForPush = this.redisService.getClient();
        this.redisForConsume = this.redisService.getClient();
    }

    public async pushTaskAsync(taskId: string, priority: number, repush = false): Promise<void> {
        if (repush) Logger.verbose(`Repush judge task: { taskId: ${taskId}, priority: ${priority} }`);
        else Logger.verbose(`New judge task: { taskId: ${taskId}, priority: ${priority} }`);
        await this.redisForPush.zadd(REDIS_KEY_JUDGE_QUEUE, priority, taskId);
    }

    public async consumeTaskAsync(): Promise<IJudgeTask | null> {
        Logger.verbose("Consuming task queue");

        // ioredis's definition doesn't have bzpopmin method

        const redisResponse: [key: string, element: string, score: string] | null = await this.redisForConsume.bzpopmin(
            REDIS_KEY_JUDGE_QUEUE,
            REDIS_CONSUME_TIMEOUT,
        );

        if (!redisResponse) {
            Logger.verbose("Consuming task queue - timeout or empty");
            return null;
        }

        const [, taskId, priorityString] = redisResponse;
        const priority = Number(priorityString);
        const task = await this.submissionService.findTaskToBeSentToJudgeByTaskIdAsync(taskId, priority);
        if (!task) {
            Logger.verbose(`Consumed judge task ${taskId} is invalid, maybe canceled?`);
            return null;
        }

        Logger.verbose(
            `Consumed judge task { taskId: ${task.taskId}, priority: ${task.priority} (${
                E_JudgeTaskPriorityType[task.priorityType]
            }) }`,
        );
        return task;
    }

    /**
     * @return `false` means the task is canceled.
     */
    public async onTaskProgressAsync(taskId: string, progress: ISubmissionProgress): Promise<boolean> {
        return this.submissionService.onTaskProgressAsync(taskId, progress);
    }
}
