import { forwardRef, Module } from "@nestjs/common";

import { RedisModule } from "@/redis/redis.module";
import { SubmissionModule } from "@/submission/submission.module";

import { JudgeGateway } from "./judge.gateway";
import { JudgeQueueService } from "./judge-queue.service";

@Module({
    imports: [forwardRef(() => SubmissionModule), forwardRef(() => RedisModule)],
    providers: [JudgeQueueService, JudgeGateway],
    exports: [JudgeQueueService, JudgeGateway],
})
export class JudgeModule {}
