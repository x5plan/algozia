import { Type } from "class-transformer";
import { IsEnum, IsNumber, IsString } from "class-validator";

import { CE_ExceptionString } from "@/common/strings/exception";
import { E_Visibility } from "@/permission/permission.enum";

import { IProblemEditable } from "../problem.type";

export class ProblemEditPostRequestBodyDto implements IProblemEditable {
    @Type(() => Number)
    @IsNumber()
    public readonly displayId: number;

    @IsString()
    public readonly title: string;

    @IsString()
    public readonly description: string;

    @IsString()
    public readonly inputFormat: string;

    @IsString()
    public readonly outputFormat: string;

    @IsString()
    public readonly samples: string;

    @Type(() => Number)
    @IsEnum(E_Visibility)
    public readonly visibility: E_Visibility;

    @IsString()
    public readonly limitAndHint: string;
}

export class ProblemEditResponseDto {
    public error?: CE_ProblemEditResponseError;
    public isNewProblem: boolean;
    public problem: IProblemEditable;
}

export const enum CE_ProblemEditResponseError {
    displayIdAlreadyExists = CE_ExceptionString.Problem_DisplayIdAlreadyExists,
}
