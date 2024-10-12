import { IsUUID } from "class-validator";

import { ProblemEntity } from "../problem.entity";
import { ProblemBasicRequestParamDto } from "./problem-shared.dto";

export class ProblemFileResponseDto {
    public problem: ProblemEntity;
    public files: ProblemFileItemDto[];
    public testDatas: ProblemFileItemDto[];
    public isAllowedEdit: boolean;
}

export class ProblemFileRequestParamDto extends ProblemBasicRequestParamDto {
    @IsUUID()
    public readonly fileId: string;
}

export class ProblemFileItemDto {
    public filename: string;
    public uuid: string;
    public size: number;
}
