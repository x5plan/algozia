import { forwardRef, Inject, Injectable } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";

import { E_CodeLanguage } from "@/code-language/code-language.type";
import { FileUploadException } from "@/common/exceptions/file";
import { FileService } from "@/file/file.service";
import { ISignedUploadRequest } from "@/file/file.type";
import { ProblemEntity } from "@/problem/problem.entity";
import { UserEntity } from "@/user/user.entity";

import { SubmissionEntity } from "./submission.entity";
import { E_SubmissionStatus } from "./submission.enum";
import { SubmissionDetailEntity } from "./submission-detail.entity";

@Injectable()
export class SubmissionService {
    constructor(
        @InjectDataSource()
        private readonly dataSource: DataSource,
        @Inject(forwardRef(() => FileService))
        private readonly fileService: FileService,
    ) {}

    public async addCodeSubmissionAsync(
        code: string,
        language: E_CodeLanguage,
        compileAndRunOptions: unknown,
        problem: ProblemEntity,
        submitter: UserEntity,
    ) {
        const submission = await this.dataSource.transaction("READ COMMITTED", async (entityManager) => {
            const submission = new SubmissionEntity();
            submission.visibility = problem.visibility;
            submission.codeLanguage = language;
            submission.answerSize = Buffer.from(code).length;
            submission.score = null;
            submission.status = E_SubmissionStatus.Pending;
            submission.submitTime = new Date();
            submission.problemId = problem.id;
            submission.submitterId = submitter.id;
            await entityManager.save(submission);

            const submissionDetail = new SubmissionDetailEntity();
            submissionDetail.submissionId = submission.id;
            submissionDetail.code = code;
            submissionDetail.compileAndRunOptions = compileAndRunOptions;
            submissionDetail.fileUuid = null;
            submissionDetail.result = null;
            await entityManager.save(submissionDetail);

            return submission;
        });

        // TODO: Add to judge queue

        return submission;
    }

    public async addFileSubmissionAsync(
        signedUploadRequest: ISignedUploadRequest,
        problem: ProblemEntity,
        submitter: UserEntity,
    ) {
        const submission = await this.dataSource.transaction("READ COMMITTED", async (entityManager) => {
            const result = await this.fileService.reportUploadFinishedAsync(signedUploadRequest, entityManager);
            if (result.error) {
                throw new FileUploadException(result.error);
            }

            const submission = new SubmissionEntity();
            submission.visibility = problem.visibility;
            submission.codeLanguage = null;
            submission.answerSize = signedUploadRequest.size;
            submission.score = null;
            submission.status = E_SubmissionStatus.Pending;
            submission.submitTime = new Date();
            submission.problemId = problem.id;
            submission.submitterId = submitter.id;

            const submissionDetail = new SubmissionDetailEntity();
            submissionDetail.submissionId = submission.id;
            submissionDetail.code = null;
            submissionDetail.compileAndRunOptions = null;
            submissionDetail.fileUuid = signedUploadRequest.uuid;
            submissionDetail.result = null;
            await entityManager.save(submissionDetail);

            return submission;
        });

        // TODO: Add to judge queue

        return submission;
    }
}
