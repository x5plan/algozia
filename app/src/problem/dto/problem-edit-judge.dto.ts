import { Transform } from "class-transformer";
import { IsEnum, IsObject } from "class-validator";

import { createJsonTransformer } from "@/common/transformers/json";
import { IProblemJudgeInfo } from "@/problem-type/problem-type.type";

import type { ProblemEntity } from "../problem.entity";
import { E_ProblemType, type IProblemJudgeInfoEditable } from "../problem.type";
import type { ProblemJudgeInfoEntity } from "../problem-judge-info.entity";

export class ProblemEditJudgePostRequestBodyDto implements IProblemJudgeInfoEditable {
    @IsEnum(E_ProblemType)
    public type: E_ProblemType;

    @Transform(createJsonTransformer())
    @IsObject()
    public info: IProblemJudgeInfo;
}

export class ProblemEditJudgeResponseDto {
    public error?: string | null;
    public hasSubmissions: boolean;
    public problem: ProblemEntity;
    public judgeInfo: ProblemJudgeInfoEntity;
    public testDataFileNames: string[];
}
