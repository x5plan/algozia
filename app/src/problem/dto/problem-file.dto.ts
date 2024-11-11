import { IsEnum, IsUUID } from "class-validator";

import { ProblemEntity } from "../problem.entity";
import { E_ProblemFileType } from "../problem.type";
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

export class ProblemFileDeletePostRequestQueryDto {
    @IsEnum(E_ProblemFileType)
    public readonly type: E_ProblemFileType;
}

export class ProblemFileItemDto {
    public filename: string;
    public uuid: string;
    public size: number;
    public type: E_ProblemFileType;
}
