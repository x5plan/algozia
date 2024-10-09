import type { E_CodeLanguage } from "@/code-language/code-language.type";
import type {
    ISubmissionContent,
    ISubmissionResultOmissibleString,
    ISubmissionTestcaseResult,
} from "@/submission/submission.type";

import type {
    IProblemJudgeInfo,
    IProblemJudgeInfoChecker,
    IProblemJudgeInfoRequiredTestcase,
    IProblemJudgeInfoSubtask,
} from "./problem-type.type";

export interface IProblemJudgeInfoTraditional extends IProblemJudgeInfo {
    /*
     * The default time / memory limit
     * One is ignored in a subtask if the it defined its own default
     */
    timeLimit: number;
    memoryLimit: number;

    /*
     * Be null if not using file IO
     */
    fileIo?: {
        inputFilename: string;
        outputFilename: string;
    };

    /*
     * If ture, samples in statement will be run before all subtasks
     * If a submission failed on samples, all subtasks will be skipped
     */
    runSamples?: boolean;

    /*
     * There could be multiple subtasks in a problem
     * Each subtask contains some testcases
     * null for detecting from testdata files automatically
     */
    subtasks: IProblemJudgeInfoTraditionalSubtask[] | null;

    checker: IProblemJudgeInfoChecker;

    // The map of files to be copied to the source code directory when compileing for each code language
    extraSourceFiles?: Partial<Record<E_CodeLanguage, Record<string, string>>>;
}

export interface IProblemJudgeInfoTraditionalSubtask extends IProblemJudgeInfoSubtask {
    /*
     * The default time / memory limit
     * One is ignored in a testcase if the it defined its own default
     */
    timeLimit?: number;
    memoryLimit?: number;

    testcases: IProblemJudgeInfoTraditionalTestcase[];
}

export interface IProblemJudgeInfoTraditionalTestcase extends IProblemJudgeInfoRequiredTestcase {
    // If one of these is null,
    // the one's default of the subtask if exists, or of problem is used
    timeLimit?: number;
    memoryLimit?: number;
}

export interface ISubmissionContentTraditional extends ISubmissionContent {
    readonly language: E_CodeLanguage;
    readonly code: string;
    readonly compileAndRunOptions: unknown;
    readonly skipSamples?: boolean;
}

// For subtasks and testcasese
export enum E_SubmissionTestcaseStatusTraditional {
    SystemError = "SystemError",

    FileError = "FileError",
    RuntimeError = "RuntimeError",
    TimeLimitExceeded = "TimeLimitExceeded",
    MemoryLimitExceeded = "MemoryLimitExceeded",
    OutputLimitExceeded = "OutputLimitExceeded",

    PartiallyCorrect = "PartiallyCorrect",
    WrongAnswer = "WrongAnswer",
    Accepted = "Accepted",

    JudgementFailed = "JudgementFailed",
}

export interface ISubmissionTestcaseResultTraditional extends ISubmissionTestcaseResult {
    testcaseInfo: {
        timeLimit: number;
        memoryLimit: number;
        inputFile: string;
        outputFile: string;
    };
    status: E_SubmissionTestcaseStatusTraditional;
    score: number;
    time?: number;
    memory?: number;
    input?: ISubmissionResultOmissibleString;
    output?: ISubmissionResultOmissibleString;
    userOutput?: ISubmissionResultOmissibleString;
    userError?: ISubmissionResultOmissibleString;
    checkerMessage?: ISubmissionResultOmissibleString;
    systemMessage?: ISubmissionResultOmissibleString;
}
