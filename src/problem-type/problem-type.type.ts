import type { E_CodeLanguage } from "@/code-language/code-language.type";
import type { ProblemFileEntity } from "@/problem/problem-file.entity";
import type { ISubmissionProgress, ISubmissionTestcaseResult } from "@/submission/submission.type";

import type { CE_JudgeInfoCheckerType, E_ProblemJudgeInfoCustomCheckerInterface } from "./problem-type.enum";
import type { IProblemJudgeInfoValidationResult } from "./validators/type";

export interface IProblemTypeServiceInterface<
    TJudgeInfo extends IProblemJudgeInfo,
    TSubmissionTestcaseResult extends ISubmissionTestcaseResult,
> {
    /**
     * Return the default judge info for a newly created problem.
     */
    get defaultJudgeInfo(): TJudgeInfo;

    /**
     * Return if a submission of the problem contains a file.
     */
    get shouldUploadAnswerFile(): boolean;

    /**
     * Return if this type of problems have the submission statistics page
     */
    get enableStatistics(): boolean;

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
     */
    validateAndFilterJudgeInfo(judgeInfo: TJudgeInfo, testData: ProblemFileEntity[]): IProblemJudgeInfoValidationResult;

    /**
     * Get time and memory used from finished submission result object.
     * @param submissionProgress The progress of a submission, guaranteed.
     * @returns An object containing the time and memory used.
     */
    getTimeAndMemoryUsedFromFinishedSubmissionProgress(
        submissionProgress: ISubmissionProgress<TSubmissionTestcaseResult>,
    ): {
        timeUsed: number | null;
        memoryUsed: number | null;
    };
}

export interface IProblemJudgeInfo {
    /*
     * There could be multiple subtasks in a problem
     * Each subtask contains some testcases
     * null for detecting from testdata files automatically
     */
    subtasks: IProblemJudgeInfoSubtask[] | null;
}

export enum E_ProblemJudgeInfoScoringType {
    Sum = "Sum",
    GroupMin = "GroupMin",
    GroupMul = "GroupMul",
}

export interface IProblemJudgeInfoSubtask {
    // Refer to https://cms.readthedocs.io/en/v1.4/Task%20types.html
    scoringType: E_ProblemJudgeInfoScoringType;

    testcases: IProblemJudgeInfoTestcase[];

    // The weight of this subtask in the problem,
    // which should add up to 100 for all subtasks of this problem
    // Auto if not set
    points?: number;

    // The IDs of subtasks this subtask depends
    // A subtask will be skipped if one of it dependencies fails
    dependencies?: number[];
}

export interface IProblemJudgeInfoTestcase {
    inputFile?: string;
    outputFile?: string;

    // The weight of this testcase in the subtask,
    // which should add up to 100 for all testcases of this subtask
    // Auto if not set
    points?: number;
}

export interface IProblemJudgeInfoOptionalInputTestcase extends IProblemJudgeInfoTestcase {
    outputFile: string;
}

export interface IProblemJudgeInfoOptionalOutputTestcase extends IProblemJudgeInfoTestcase {
    inputFile: string;
}

export interface IProblemJudgeInfoRequiredTestcase extends IProblemJudgeInfoTestcase {
    inputFile: string;
    outputFile: string;
}

export interface IProblemJudgeInfoIntegersChecker {
    type: CE_JudgeInfoCheckerType.Integers;
}

export interface IProblemJudgeInfoFloatsChecker {
    type: CE_JudgeInfoCheckerType.Floats;
    precision: number;
}

export interface IProblemJudgeInfoLinesChecker {
    type: CE_JudgeInfoCheckerType.Lines;
    caseSensitive: boolean;
}

export interface IProblemJudgeInfoBinaryChecker {
    type: CE_JudgeInfoCheckerType.Binary;
}

export interface IProblemJudgeInfoCustomChecker {
    type: CE_JudgeInfoCheckerType.Custom;
    interface: E_ProblemJudgeInfoCustomCheckerInterface;
    language: E_CodeLanguage;
    compileAndRunOptions: unknown;
    filename: string;
    timeLimit?: number;
    memoryLimit?: number;
}

// integers: check the equivalent of each integer in user's output and answer
// floats:   check each float in user's output and answer
//           allow output with relative or absolute error not exceeding [floats.precision].
// lines:    check the equivalent of text in each line (separated by "\n"), maybe case-insensitive
//           any space characters (space, \t, \r) in the end of a line will be ignored
//           any empty lines in the end of file will be ignored
// binary:   check if the user's output and answer files are equal in binary
// custom:   use a custom program to check the user's output
export type IProblemJudgeInfoChecker =
    | IProblemJudgeInfoIntegersChecker
    | IProblemJudgeInfoFloatsChecker
    | IProblemJudgeInfoLinesChecker
    | IProblemJudgeInfoBinaryChecker
    | IProblemJudgeInfoCustomChecker;
