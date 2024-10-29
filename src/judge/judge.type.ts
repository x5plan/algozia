import type { E_ProblemType } from "@/problem/problem.type";
import type { IProblemJudgeInfo } from "@/problem-type/problem-type.type";
import type { ISubmissionContent } from "@/submission/submission.type";

import type { E_JudgeTaskPriorityType } from "./judge.enum";

interface IJudgeTaskExtraInfo {
    problemType: E_ProblemType;
    judgeInfo: IProblemJudgeInfo;
    samples?: null;
    testData: Record<string, string>;
    submissionContent: ISubmissionContent | {}; // eslint-disable-line @typescript-eslint/no-empty-object-type
    file?: {
        uuid: string | null;
        url: string | null;
    } | null;
}

// Extra info is also send to judge client while ONLY meta is used to identity the task
export interface IJudgeTask {
    taskId: string;
    priorityType: E_JudgeTaskPriorityType;
    priority: number;
    extraInfo: IJudgeTaskExtraInfo;
}
