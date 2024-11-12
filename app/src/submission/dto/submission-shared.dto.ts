import { Type } from "class-transformer";
import { IsInt, Min } from "class-validator";

export class SubmissionBasicRequestParamDto {
    @Type(() => Number)
    @IsInt()
    @Min(0)
    public readonly id: number;
}
