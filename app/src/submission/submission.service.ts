import { forwardRef, Inject, Injectable, Logger } from "@nestjs/common";
import { InjectDataSource, InjectRepository } from "@nestjs/typeorm";
import { DataSource, QueryBuilder, Repository } from "typeorm";
import { v4 as uuid4 } from "uuid";

import { E_CodeLanguage } from "@/code-language/code-language.type";
import { FileUploadException } from "@/common/exceptions/file";
import { ConfigService } from "@/config/config.service";
import { FileService } from "@/file/file.service";
import { E_JudgeTaskPriorityType } from "@/judge/judge.enum";
import { IJudgeTask } from "@/judge/judge.type";
import { JudgeQueueService } from "@/judge/judge-queue.service";
import { ProblemEntity } from "@/problem/problem.entity";
import { ProblemService } from "@/problem/problem.service";
import { ProblemTypeService } from "@/problem-type/problem-type.service";
import { LockService } from "@/redis/lock.service";
import { CE_LockType } from "@/redis/lock.type";
import { UserEntity } from "@/user/user.entity";

import { SubmissionEntity } from "./submission.entity";
import { E_SubmissionProgressType, E_SubmissionStatus } from "./submission.enum";
import { ISubmissionProgress } from "./submission.type";
import { makeSubmissionPriority } from "./submission.util";
import { SubmissionDetailEntity } from "./submission-detail.entity";

@Injectable()
export class SubmissionService {
    constructor(
        @InjectDataSource()
        private readonly dataSource: DataSource,
        @InjectRepository(SubmissionEntity)
        private readonly submissionRepository: Repository<SubmissionEntity>,
        @Inject(forwardRef(() => FileService))
        private readonly fileService: FileService,
        @Inject(forwardRef(() => JudgeQueueService))
        private readonly judgeQueueService: JudgeQueueService,
        @Inject(forwardRef(() => ProblemService))
        private readonly problemService: ProblemService,
        @Inject(forwardRef(() => ProblemTypeService))
        private readonly problemTypeService: ProblemTypeService,
        private readonly lockService: LockService,
        private readonly configService: ConfigService,
    ) {}

    public async findSubmissionByIdAsync(id: number): Promise<SubmissionEntity | null> {
        return await this.submissionRepository.findOne({ where: { id } });
    }

    public async findSubmissionByTaskIdAsync(taskId: string): Promise<SubmissionEntity | null> {
        return await this.submissionRepository.findOne({ where: { taskId } });
    }

    public async findTaskToBeSentToJudgeByTaskIdAsync(taskId: string, priority: number): Promise<IJudgeTask | null> {
        try {
            const submission = await this.findSubmissionByTaskIdAsync(taskId);
            if (!submission) return null;

            const submissionDetail = await submission.detailPromise;
            if (!submissionDetail) return null;

            const problem = await this.problemService.findProblemByIdAsync(submission.problemId);
            if (!problem) return null;
            const problemJudgeInfo = await problem.judgeInfoPromise;
            if (!problemJudgeInfo) return null;

            const preprocessedJudgeInfo = await this.problemService.getPreprocessedProblemJudgeInfoAsync(
                problem,
                problemJudgeInfo,
            );
            const testData = await this.problemService.findProblemTestdataFilesAsync(problem);

            const shouldUploadAnswerFile = this.problemTypeService.get(problemJudgeInfo.type).shouldUploadAnswerFile;

            return {
                taskId,
                type: "Submission",
                priorityType: E_JudgeTaskPriorityType.High,
                priority,
                extraInfo: {
                    problemType: problemJudgeInfo.type,
                    judgeInfo: preprocessedJudgeInfo,
                    samples: null,
                    testData: Object.fromEntries(
                        testData.map((problemFile) => [problemFile.filename, problemFile.uuid]),
                    ),
                    submissionContent: shouldUploadAnswerFile
                        ? {}
                        : {
                              code: submissionDetail.code,
                              language: submission.codeLanguage,
                              skipSamples: true,
                              compileAndRunOptions: submissionDetail.compileAndRunOptions,
                          },
                    file: shouldUploadAnswerFile
                        ? {
                              uuid: submissionDetail.fileUuid,
                              url:
                                  submissionDetail.fileUuid &&
                                  (await this.fileService.signDownloadUrlAsync(submissionDetail.fileUuid)),
                          }
                        : null,
                },
            };
        } catch (e) {
            Logger.error(`Error in getTaskById("${taskId}"): ${e}`);
            return null;
        }
    }

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

    public async addFileSubmissionAsync(token: string, problem: ProblemEntity, submitter: UserEntity) {
        const submission = await this.dataSource.transaction("READ COMMITTED", async (entityManager) => {
            const result = await this.fileService.reportUploadFinishedAsync(token, entityManager);
            if (result.error) {
                throw new FileUploadException(result.error);
            }

            const submission = new SubmissionEntity();
            submission.visibility = problem.visibility;
            submission.codeLanguage = null;
            submission.answerSize = result.file.size;
            submission.score = null;
            submission.status = E_SubmissionStatus.Pending;
            submission.submitTime = new Date();
            submission.problemId = problem.id;
            submission.submitterId = submitter.id;

            const submissionDetail = new SubmissionDetailEntity();
            submissionDetail.submissionId = submission.id;
            submissionDetail.code = null;
            submissionDetail.compileAndRunOptions = null;
            submissionDetail.fileUuid = result.file.uuid;
            submissionDetail.result = null;
            await entityManager.save(submissionDetail);

            return submission;
        });

        // TODO: Add to judge queue

        return submission;
    }

    /**
     * @param submission Must be locked (or just created, ID not exposed to user).
     */
    public async judgeSubmissionAsync(submission: SubmissionEntity, isRejudge = false) {
        const oldSubmission = { ...submission };

        if (submission.taskId) {
            // TODO: Cancel task
            //this.judgeGateway.cancelTask(submission.taskId);
        }

        submission.taskId = uuid4();
        submission.score = null;
        submission.status = E_SubmissionStatus.Pending;
        submission.timeUsed = null;
        submission.memoryUsed = null;
        await this.submissionRepository.save(submission);

        const selectTotalOccupiedTimeRecently = (qb: QueryBuilder<SubmissionEntity>) => {
            qb.select("SUM(totalOccupiedTime)", "total").andWhere("submitTime >= NOW() - INTERVAL 15 MINUTE");
        };

        const findUserPendingCountAsync = async (): Promise<number> => {
            return await this.submissionRepository.countBy({
                status: E_SubmissionStatus.Pending,
                submitterId: submission.submitterId,
            });
        };

        const findUserOccupiedTimeRecentlyAsync = async (): Promise<number> => {
            const qb = this.submissionRepository.createQueryBuilder();
            selectTotalOccupiedTimeRecently(qb);
            const result = await qb.where({ submitterId: submission.submitterId }).getRawOne<{ total: number }>();
            return result ? result.total : 0;
        };

        const findAvgAndStdEveryUsersOccupiedTimeRecentlyAsync = async (): Promise<{ avg: number; std: number }> => {
            return (
                (await this.dataSource
                    .createQueryBuilder()
                    .select("AVG(total)", "avg")
                    .addSelect("STD(total)", "std")
                    .from((qb) => {
                        qb.select().from(SubmissionEntity, "submission");
                        selectTotalOccupiedTimeRecently(qb);
                        qb.groupBy("submission.submitterId");
                        return qb;
                    }, "totalResult")
                    .getRawOne<{ avg: number; std: number }>()) || { avg: 0, std: 0 }
            );
        };

        const [
            userPendingCount,
            userOccupiedTimeRecently,
            { avg: avgEveryUsersOccupiedTimeRecently, std: stdEveryUsersOccupiedTimeRecently },
        ] =
            this.configService.config.judge.dynamicTaskPriority && !isRejudge
                ? await Promise.all([
                      findUserPendingCountAsync(),
                      findUserOccupiedTimeRecentlyAsync(),
                      findAvgAndStdEveryUsersOccupiedTimeRecentlyAsync(),
                  ])
                : [0, 0, { avg: 0, std: 0 }];

        await this.judgeQueueService.pushTaskAsync(
            submission.taskId,
            makeSubmissionPriority(
                submission.id,
                userPendingCount,
                userOccupiedTimeRecently,
                avgEveryUsersOccupiedTimeRecently,
                stdEveryUsersOccupiedTimeRecently,
                isRejudge ? E_JudgeTaskPriorityType.Medium : E_JudgeTaskPriorityType.High,
            ),
        );

        await this.onSubmissionUpdatedAsync(oldSubmission, submission);
    }

    /**
     * This function updates related info, the problem must be locked for Read first, then the submission must be locked.
     */
    private async onSubmissionUpdatedAsync(
        oldSubmission: SubmissionEntity,
        submission: SubmissionEntity,
    ): Promise<void> {
        // await this.submissionStatisticsService.onSubmissionUpdated(oldSubmission, submission);

        const oldAccepted = oldSubmission.status === E_SubmissionStatus.Accepted;
        const newAccepted = submission.status === E_SubmissionStatus.Accepted;
        if (!oldAccepted && newAccepted) {
            // await this.problemService.updateProblemStatistics(submission.problemId, 0, 1);
            // await this.userService.updateUserAcceptedCount(
            //     submission.submitterId,
            //     submission.problemId,
            //     "NON_AC_TO_AC",
            // );
        } else if (oldAccepted && !newAccepted) {
            // await this.problemService.updateProblemStatistics(submission.problemId, 0, -1);
            // await this.userService.updateUserAcceptedCount(
            //     submission.submitterId,
            //     submission.problemId,
            //     "AC_TO_NON_AC",
            // );
        }
    }

    /**
     * This function updates related info, the problem must be locked for Read first, then the submission must be locked.
     */
    private async onSubmissionFinishedAsync(
        submission: SubmissionEntity,
        problem: ProblemEntity,
        progress: ISubmissionProgress,
    ): Promise<void> {
        const oldSubmission = { ...submission };

        const submissionDetail = await submission.detailPromise;

        if (!submissionDetail) {
            Logger.error(`Submission ${submission.id} has no detail`);
            return;
        }

        submissionDetail.result = progress;

        submission.taskId = null;
        submission.status = progress.status!; // I'm sure it's finished
        submission.score = progress.score!; // I'm sure it's finished
        submission.totalOccupiedTime = progress.totalOccupiedTime!;

        const judgeInfo = await problem.judgeInfoPromise;
        if (!judgeInfo) {
            Logger.error(`Problem ${problem.id} has no judge info`);
            return;
        }

        const timeAndMemory = this.problemTypeService
            .get(judgeInfo.type)
            .getTimeAndMemoryUsedFromFinishedSubmissionProgress(submissionDetail.result);
        submission.timeUsed = timeAndMemory.timeUsed;
        submission.memoryUsed = timeAndMemory.memoryUsed;

        await this.dataSource.transaction(async (transactionalEntityManager) => {
            await transactionalEntityManager.save(submission);
            await transactionalEntityManager.save(submissionDetail);
        });

        Logger.log(`Submission ${submission.id} finished with status ${submission.status}`);

        await this.onSubmissionUpdatedAsync(oldSubmission, submission);
    }

    /**
     * @return `false` means the task is canceled.
     */
    public async onTaskProgressAsync(taskId: string, progress: ISubmissionProgress): Promise<boolean> {
        const submission = await this.findSubmissionByTaskIdAsync(taskId);
        if (!submission) {
            Logger.warn(`Invalid task Id ${taskId} of task progress, maybe there's a too-early rejudge?`);
            return false;
        }

        const finished = progress.progressType === E_SubmissionProgressType.Finished;

        // Don't lock the problem if not finished since we don't modify the database.

        await this.lockSubmissionAsync(submission, finished, async (submission, problem?) => {
            if (!submission || submission.taskId !== taskId) {
                Logger.warn(`Invalid task Id ${taskId} of task progress, maybe there's a too-early rejudge?`);
                return;
            }

            // First update database, then report progress
            if (finished) {
                // I'm sure the problem exists if the submission exists
                await this.onSubmissionFinishedAsync(submission, problem!, progress);
            }

            // TODO: Report progress
            // await this.submissionProgressService.emitSubmissionEvent(
            //     submission.id,
            //     SubmissionEventType.Progress,
            //     progress,
            // );
        });

        return true;
    }

    /**
     * Lock a submission and its problem (optionally). Ensure the submission's `taskId` is not changed and its problem exists.
     */
    public async lockSubmissionAsync<T>(
        submission: SubmissionEntity,
        lockProblem: boolean,
        callbackAsync: (submission: SubmissionEntity | null, problem?: ProblemEntity) => Promise<T>,
    ): Promise<T> {
        if (lockProblem) {
            return await this.problemService.lockProblemByIdAsync(
                submission.problemId,
                CE_LockType.Read,
                async (problem) => {
                    if (!problem) return await callbackAsync(null);
                    return await this.lockService.lockAsync(
                        `Submission_${submission.id}`,
                        async () => await callbackAsync(await this.findSubmissionByIdAsync(submission.id), problem),
                    );
                },
            );
        }

        return await this.lockService.lockAsync(
            `Submission_${submission.id}`,
            async () => await callbackAsync(await this.findSubmissionByIdAsync(submission.id)),
        );
    }
}
