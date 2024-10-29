import { forwardRef, Module } from "@nestjs/common";

import { RedisModule } from "@/redis/redis.module";
import { SubmissionModule } from "@/submission/submission.module";

import { JudgeQueueService } from "./judge-queue.service";

@Module({
    imports: [forwardRef(() => SubmissionModule), forwardRef(() => RedisModule)],
    providers: [JudgeQueueService],
    exports: [JudgeQueueService],
})
export class JudgeModule {}
