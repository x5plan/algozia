import type { ProblemEntity } from "../problem.entity";
import type { ProblemJudgeInfoEntity } from "../problem-judge-info.entity";

export class ProblemDetailResponseDto {
    public problem: ProblemEntity;
    public judgeInfo: ProblemJudgeInfoEntity | null;
    public hasAdditionalFiles: boolean;
    public hasTestdataFiles: boolean;
    public testdata?: unknown;

    public isAllowedEdit: boolean;
    public isAllowedSubmit: boolean;
}
