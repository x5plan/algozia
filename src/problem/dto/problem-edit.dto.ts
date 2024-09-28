import { Type } from "class-transformer";
import { IsIn, IsNumber, IsString, Min } from "class-validator";

import { CE_ExceptionString } from "@/common/strings/exception";

import { CE_ProblemVisibility, IProblemEditable } from "../problem.type";

export class ProblemEditRequestParamDto {
    @Type(() => Number)
    @IsNumber()
    @Min(0)
    public id: number;
}

export class ProblemEditPostRequestBodyDto implements IProblemEditable {
    @Type(() => Number)
    @IsNumber()
    public displayId: number;

    @IsString()
    public title: string;

    @IsString()
    public description: string;

    @IsString()
    public inputFormat: string;

    @IsString()
    public outputFormat: string;

    @IsString()
    public samples: string;

    @Type(() => Number)
    @IsIn([
        CE_ProblemVisibility.Private,
        CE_ProblemVisibility.Internal,
        CE_ProblemVisibility.Paid,
        CE_ProblemVisibility.Public,
    ])
    public visibility: CE_ProblemVisibility;

    @IsString()
    public limitAndHint: string;
}

export class ProblemEditResponseDto {
    public error?: CE_ProblemEditResponseError;
    public isNewProblem: boolean;
    public problem: IProblemEditable;
    public visibilityStringMap: IVisibilityStringMap;
}

export const enum CE_ProblemEditResponseError {
    displayIdAlreadyExists = CE_ExceptionString.Problem_DisplayIdAlreadyExists,
}

export type IVisibilityStringMap = Record<CE_ProblemVisibility, string>;
