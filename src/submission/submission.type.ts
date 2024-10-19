import type { IJudgeTaskProgress } from "@/judge/judge.type";

import type { E_SubmissionProgressType, E_SubmissionStatus } from "./submission.enum";

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface ISubmissionTestcaseResult {}

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
