import type { ProblemEntity } from "@/problem/problem.entity";
import type { ProblemJudgeInfoEntity } from "@/problem/problem-judge-info.entity";

import type { SubmissionEntity } from "../submission.entity";
import type { SubmissionDetailEntity } from "../submission-detail.entity";

export class SubmissionDetailResponseDto {
    public submission: SubmissionEntity;
    public detail: SubmissionDetailEntity;
    public problem: ProblemEntity;
    public judgeInfo: ProblemJudgeInfoEntity | null;
}
