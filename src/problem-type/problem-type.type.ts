import type { ValidationError } from "class-validator";

import type { FileEntity } from "@/file/file.entity";
import type { IProblemJudgeInfo } from "@/problem/problem.type";
import type { ProblemFileEntity } from "@/problem/problem-file.entity";
import type { ISubmissionContent, ISubmissionProgress, ISubmissionTestcaseResult } from "@/submission/submission.type";

export interface IProblemTypeServiceInterface<
    TJudgeInfo extends IProblemJudgeInfo,
    TSubmissionContent extends ISubmissionContent,
    TSubmissionTestcaseResult extends ISubmissionTestcaseResult,
> {
    /**
     * Return the default judge info for a newly created problem.
     */
    getDefaultJudgeInfo(): TJudgeInfo;

    /**
     * Return if a submission of the problem contains a file.
     */
    shouldUploadAnswerFile(): boolean;

    /**
     * Return if this type of problems have the submission statistics page
     */
    enableStatistics(): boolean;

    /**
     * Preprocess judge info for judging, e.g. detect testcases automatically from test data when configured.
     * @param judgeInfo The judge info set by problem manager.
     * @param testData The problem's testdata files.
     * @return The preprocessed judge info to be sent to judge.
     */
    preprocessJudgeInfo(judgeInfo: TJudgeInfo, testData: ProblemFileEntity[]): TJudgeInfo;

    /**
     * Validate a preprocessed judge info and remove non-whitelisted properties from it.
     * Return if valid and throw an array of error info if invalid.
     * @param judgeInfo The preprocessed judge info to be sent to judge. Non-whitelisted properties will be removed.
     * @param testData The problem's testdata files.
     * @param ignoreLimits Ignore the limits in the config (e.g. the judge info is submitted by a privileged user).
     * @throws An array of error info `[error, arg1, arg2, ...]` if failed.
     */
    validateAndFilterJudgeInfo(judgeInfo: TJudgeInfo, testData: ProblemFileEntity[], ignoreLimits: boolean): void;

    /**
     * Validate a submission content submitted by user. Return the validation errors by class-validator.
     * @param submissionContent The submission content submitted by user.
     * @returns The validation errors by class-validator.
     */
    validateSubmissionContentAsync(submissionContent: TSubmissionContent): Promise<ValidationError[]>;

    /**
     * Get code language and answer size from submission content and file submitted by user.
     * @param submissionContent The submission content submitted by user.
     * @param file The file submitted by user.
     * @returns An object containing the code language and answer size of the submission content.
     */
    getCodeLanguageAndAnswerSizeFromSubmissionContentAndFileAsync(
        submissionContent: TSubmissionContent,
        file?: FileEntity,
    ): Promise<{
        language: string;
        answerSize: number;
    }>;

    /**
     * Get time and memory used from finished submission result object.
     * @param submissionProgress The progress of a submission, guaranteed.
     * @returns An object containing the time and memory used.
     */
    getTimeAndMemoryUsedFromFinishedSubmissionProgress(
        submissionProgress: ISubmissionProgress<TSubmissionTestcaseResult>,
    ): {
        timeUsed: number;
        memoryUsed: number;
    };
}
