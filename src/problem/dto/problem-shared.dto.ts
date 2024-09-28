import { Type } from "class-transformer";
import { IsNumber, Min } from "class-validator";

import type { CE_ProblemVisibility } from "../problem.type";

export class ProblemBasicRequestParamDto {
    @Type(() => Number)
    @IsNumber()
    @Min(0)
    public id: number;
}

export type IVisibilityStringMap = Record<CE_ProblemVisibility, string>;
export type IVisibilityLabelColorMap = Record<CE_ProblemVisibility, string>;
