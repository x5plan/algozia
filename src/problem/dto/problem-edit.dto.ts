import { Type } from "class-transformer";
import { IsIn, IsNumber, IsString } from "class-validator";

import { CE_ExceptionString } from "@/common/strings/exception";

import { CE_ProblemVisibility, IProblemEditable } from "../problem.type";

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
    @IsIn([
        CE_ProblemVisibility.Private,
        CE_ProblemVisibility.Internal,
        CE_ProblemVisibility.Paid,
        CE_ProblemVisibility.Public,
    ])
    public readonly visibility: CE_ProblemVisibility;

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
