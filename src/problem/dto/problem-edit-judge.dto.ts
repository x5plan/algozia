import { Transform } from "class-transformer";
import { IsBoolean, IsEnum, IsObject, IsOptional } from "class-validator";

import { createBooleanTransformer } from "@/common/transformers/boolean";
import { createJsonTransformer } from "@/common/transformers/json";
import { IProblemJudgeInfo } from "@/problem-type/problem-type.type";

import type { ProblemEntity } from "../problem.entity";
import { E_ProblemType, type IProblemJudgeInfoEditable } from "../problem.type";
import { ProblemJudgeInfoEntity } from "../problem-judge-info.entity";

export class ProblemEditJudgeGetRequestQueryDto {
    @Transform(createBooleanTransformer())
    @IsBoolean()
    @IsOptional()
    public preprocess: boolean;
}

export class ProblemEditJudgePostRequestBodyDto implements IProblemJudgeInfoEditable {
    @IsEnum(E_ProblemType)
    public type: E_ProblemType;

    @Transform(createJsonTransformer())
    @IsObject()
    public judgeInfo: IProblemJudgeInfo;
}

export class ProblemEditJudgeResponseDto {
    public hasSubmissions: boolean;
    public problem: ProblemEntity;
    public judgeInfo: ProblemJudgeInfoEntity;
    public problemFileNames: string[];
}
