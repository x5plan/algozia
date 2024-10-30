import { forwardRef, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { FileModule } from "@/file/file.module";
import { JudgeModule } from "@/judge/judge.module";
import { ProblemModule } from "@/problem/problem.module";
import { ProblemTypeModule } from "@/problem-type/problem-type.module";
import { RedisModule } from "@/redis/redis.module";

import { SubmissionController } from "./submission.controller";
import { SubmissionEntity } from "./submission.entity";
import { SubmissionService } from "./submission.service";
import { SubmissionDetailEntity } from "./submission-detail.entity";

@Module({
    imports: [
        TypeOrmModule.forFeature([SubmissionEntity]),
        TypeOrmModule.forFeature([SubmissionDetailEntity]),
        forwardRef(() => FileModule),
        forwardRef(() => ProblemModule),
        forwardRef(() => ProblemTypeModule),
        forwardRef(() => JudgeModule),
        forwardRef(() => RedisModule),
    ],
    controllers: [SubmissionController],
    providers: [SubmissionService],
    exports: [SubmissionService],
})
export class SubmissionModule {}
