import { forwardRef, Module } from "@nestjs/common";

import { FileModule } from "@/file/file.module";
import { ProblemModule } from "@/problem/problem.module";

import { SubmissionController } from "./submission.controller";
import { SubmissionService } from "./submission.service";

@Module({
    imports: [forwardRef(() => FileModule), forwardRef(() => ProblemModule)],
    controllers: [SubmissionController],
    providers: [SubmissionService],
    exports: [SubmissionService],
})
export class SubmissionModule {}
