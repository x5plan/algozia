import type {
    ISubmissionContent,
    ISubmissionResultOmissibleString,
    ISubmissionTestcaseResult,
} from "@/submission/submission.type";

import type {
    IProblemJudgeInfo,
    IProblemJudgeInfoChecker,
    IProblemJudgeInfoOptionalInputTestcase,
    IProblemJudgeInfoSubtask,
} from "./problem-type.type";

export interface IProblemJudgeInfoSubmitAnswer extends IProblemJudgeInfo {
    /*
     * There could be multiple subtasks in a problem
     * Each subtask contains some testcases
     * null for detecting from testdata files automatically
     */
    subtasks: IProblemJudgeInfoSubmitAnswerSubtask[] | null;

    checker: IProblemJudgeInfoChecker;
}

export interface IProblemJudgeInfoSubmitAnswerSubtask extends IProblemJudgeInfoSubtask {
    testcases: IProblemJudgeInfoSubmitAnswerTestcase[];
}

export interface IProblemJudgeInfoSubmitAnswerTestcase extends IProblemJudgeInfoOptionalInputTestcase {
    // By default, user's output filename is equal to output filename
    userOutputFilename?: string;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface ISubmissionContentSubmitAnswer extends ISubmissionContent {}

export enum E_SubmissionTestcaseStatusSubmitAnswer {
    SystemError = "SystemError",

    FileError = "FileError",
    OutputLimitExceeded = "OutputLimitExceeded",

    PartiallyCorrect = "PartiallyCorrect",
    WrongAnswer = "WrongAnswer",
    Accepted = "Accepted",

    JudgementFailed = "JudgementFailed",
}

export interface ISubmissionTestcaseResultSubmitAnswer extends ISubmissionTestcaseResult {
    testcaseInfo: {
        inputFile: string;
        outputFile: string;
    };
    status: E_SubmissionTestcaseStatusSubmitAnswer;
    score: number;
    input?: ISubmissionResultOmissibleString;
    output?: ISubmissionResultOmissibleString;
    userOutput?: ISubmissionResultOmissibleString;
    userOutputLength?: number;
    checkerMessage?: ISubmissionResultOmissibleString;
    systemMessage?: ISubmissionResultOmissibleString;
}
