import { Transform, Type } from "class-transformer";
import { IsBoolean, IsEnum, IsInt, IsOptional, IsString } from "class-validator";

import { createBooleanTransformer } from "@/common/transformers/boolean";

import type { ProblemEntity } from "../problem.entity";
import { E_ProblemType, type IProblemJudgeInfoEditable } from "../problem.type";
import { ProblemJudgeInfoEntity } from "../problem-judge-info.entity";

export class ProblemEditJudgePostRequestBodyDto implements IProblemJudgeInfoEditable {
    @IsEnum(E_ProblemType)
    public type: E_ProblemType;

    @Type(() => Number)
    @IsInt()
    @IsOptional()
    public timeLimit?: number;

    @Type(() => Number)
    @IsInt()
    @IsOptional()
    public memoryLimit?: number;

    @Transform(createBooleanTransformer())
    @IsBoolean()
    @IsOptional()
    public fileIO?: boolean;

    @IsString()
    @IsOptional()
    public inputFileName?: string;

    @IsString()
    @IsOptional()
    public outputFileName?: string;
}

export class ProblemEditJudgeResponseDto {
    public hasSubmissions: boolean;
    public problem: ProblemEntity;
    public judgeInfo: ProblemJudgeInfoEntity;
}
