import { forwardRef, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { FileModule } from "@/file/file.module";
import { RedisModule } from "@/redis/redis.module";
import { SubmissionModule } from "@/submission/submission.module";

import { JudgeGateway } from "./judge.gateway";
import { JudgeClientEntity } from "./judge-client.entity";
import { JudgeClientService } from "./judge-client.service";
import { JudgeQueueService } from "./judge-queue.service";

@Module({
    imports: [
        TypeOrmModule.forFeature([JudgeClientEntity]),
        forwardRef(() => SubmissionModule),
        forwardRef(() => RedisModule),
        forwardRef(() => FileModule),
    ],
    providers: [JudgeClientService, JudgeQueueService, JudgeGateway],
    exports: [JudgeClientService, JudgeQueueService, JudgeGateway],
})
export class JudgeModule {}
