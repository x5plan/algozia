import type {
    ISubmissionContent,
    ISubmissionResultOmissibleString,
    ISubmissionTestcaseResult,
} from "@/submission/submission.type";

import type {
    IProblemJudgeInfo,
    IProblemJudgeInfoOptionalInputTestcase,
    IProblemJudgeInfoSubtask,
} from "./problem-type.type";
import type { IChecker } from "./validators/checker";

export interface IProblemJudgeInfoSubmitAnswer extends IProblemJudgeInfo {
    /*
     * There could be multiple subtasks in a problem
     * Each subtask contains some testcases
     * null for detecting from testdata files automatically
     */
    subtasks?: IProblemJudgeInfoSubmitAnswerSubtask[];

    checker: IChecker;
}

export interface IProblemJudgeInfoSubmitAnswerSubtask extends IProblemJudgeInfoSubtask {
    testcases: IProblemJudgeInfoSubmitAnswerTestcase[];

    // Refer to https://cms.readthedocs.io/en/v1.4/Task%20types.html
    scoringType: "Sum" | "GroupMin" | "GroupMul";

    // The weight of this subtask in the problem,
    // which should add up to 100 for all subtasks of this problem
    // Auto if not set
    points?: number;

    // The IDs of subtasks this subtask depends
    // A subtask will be skipped if one of it dependencies fails
    dependencies?: number[];
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
