import type { E_CodeLanguage } from "@/code-language/code-language.enum";
import type {
    ISubmissionContent,
    ISubmissionResultOmissibleString,
    ISubmissionTestcaseResult,
} from "@/submission/submission.type";

import type {
    IProblemJudgeInfo,
    IProblemJudgeInfoOptionalOutputTestcase,
    IProblemJudgeInfoSubtask,
} from "./problem-type.type";

export interface IProblemJudgeInfoInteraction extends IProblemJudgeInfo {
    /*
     * The default time / memory limit
     * One is ignored in a subtask if the it defined its own default
     */
    timeLimit: number;
    memoryLimit: number;

    /*
     * There could be multiple subtasks in a problem
     * Each subtask contains some testcases
     * null for detecting from testdata files automatically
     */
    subtasks: IProblemJudgeInfoInteractionSubtask[] | null;

    // The program to send command and data to user's program and outputs user's score
    interactor: IProblemJudgeInfoInteractionInteractor | null;

    // The map of files to be copied to the source code directory when compiling for each code language
    extraSourceFiles?: Partial<Record<E_CodeLanguage, Record<string, string>>>;
}

export interface IProblemJudgeInfoInteractionSubtask extends IProblemJudgeInfoSubtask {
    /*
     * The default time / memory limit
     * One is ignored in a testcase if the it defined its own default
     */
    timeLimit?: number;
    memoryLimit?: number;

    testcases: IProblemJudgeInfoInteractionTestcase[];
}

export interface IProblemJudgeInfoInteractionTestcase extends IProblemJudgeInfoOptionalOutputTestcase {
    // If one of these is null,
    // the one's default of the subtask if exists, or of problem is used
    timeLimit?: number;
    memoryLimit?: number;
}

export enum E_ProblemJudgeInfoInteractionInteractorInterface {
    stdio = "stdio",
    shm = "shm",
}

export interface IProblemJudgeInfoInteractionInteractor {
    // stdio: The interactor and user's program's stdin and stdout are connected with two pipes
    // shm: A shared memory region is created for interactor and user's program's communication
    interface: E_ProblemJudgeInfoInteractionInteractorInterface;
    sharedMemorySize?: number;
    language: E_CodeLanguage;
    compileAndRunOptions: unknown;
    filename: string;
    timeLimit?: number;
    memoryLimit?: number;
}

// For subtasks and testcases
export enum E_SubmissionTestcaseStatusInteraction {
    SystemError = "SystemError",

    RuntimeError = "RuntimeError",
    TimeLimitExceeded = "TimeLimitExceeded",
    MemoryLimitExceeded = "MemoryLimitExceeded",
    OutputLimitExceeded = "OutputLimitExceeded",

    PartiallyCorrect = "PartiallyCorrect",
    WrongAnswer = "WrongAnswer",
    Accepted = "Accepted",

    JudgementFailed = "JudgementFailed",
}

export interface ISubmissionTestcaseResultInteraction extends ISubmissionTestcaseResult {
    testcaseInfo: {
        timeLimit: number;
        memoryLimit: number;
        inputFile: string;
    };
    status: E_SubmissionTestcaseStatusInteraction;
    score: number;
    time?: number;
    memory?: number;
    input?: ISubmissionResultOmissibleString;
    userError?: ISubmissionResultOmissibleString;
    interactorMessage?: ISubmissionResultOmissibleString;
    systemMessage?: ISubmissionResultOmissibleString;
}

export interface ISubmissionContentInteraction extends ISubmissionContent {
    language: E_CodeLanguage;
    code: string;
    compileAndRunOptions: unknown;
    skipSamples?: boolean;
}
