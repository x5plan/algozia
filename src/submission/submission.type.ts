import type { IJudgeTaskProgress } from "@/judge/judge.type";

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface ISubmissionContent {}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface ISubmissionTestcaseResult {}

export enum E_SubmissionProgressType {
    Preparing = "Preparing",
    Compiling = "Compiling",
    Running = "Running",
    Finished = "Finished",
}

export enum E_SubmissionStatus {
    Pending = "Pending",

    ConfigurationError = "ConfigurationError",
    SystemError = "SystemError",
    Canceled = "Canceled",

    CompilationError = "CompilationError",

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

export type ISubmissionResultOmissibleString =
    | string
    | {
          data: string;
          omittedLength: number;
      };

interface ITestcaseProgressReference {
    // If !waiting && !running && !testcaseHash, it's "Skipped"
    waiting?: boolean;
    running?: boolean;
    testcaseHash?: string;
}

export interface ISubmissionProgress<TestcaseResult extends ISubmissionTestcaseResult = ISubmissionTestcaseResult>
    extends IJudgeTaskProgress {
    progressType: E_SubmissionProgressType;

    // Only valid when finished
    status?: E_SubmissionStatus;
    score?: number;
    totalOccupiedTime?: number;

    compile?: {
        compileTaskHash: string;
        success: boolean;
        message: ISubmissionResultOmissibleString;
    };

    systemMessage?: ISubmissionResultOmissibleString;

    // testcaseHash
    // ->
    // result
    testcaseResult?: Record<string, TestcaseResult>;
    samples?: ITestcaseProgressReference[];
    subtasks?: {
        score: number;
        fullScore: number;
        testcases: ITestcaseProgressReference[];
    }[];
}
