import { Type } from "class-transformer";
import { IsEnum, IsNumber, Length, ValidateNested } from "class-validator";

import { CE_ExceptionString } from "@/common/strings/exception";
import { IsValidFilename } from "@/common/validators/filename";
import { SignedUploadRequestDto } from "@/file/dto/file-upload-request.dto";
import { CE_FileUploadError, ISignedUploadRequest } from "@/file/file.type";

import { E_ProblemFileType } from "../problem.type";

export class ProblemSignFileUploadRequestPostRequestBodyDto {
    @IsNumber()
    public readonly size: number;
}

// All the properties in this DTO will be sent to the client as JSON, do not include any sensitive information.
export class ProblemSignFileUploadRequestResponseDto {
    public error?: CE_ProblemFileUploadError;
    public uploadRequest?: ISignedUploadRequest;
}

export class ProblemReportFileUploadFinishedPostRequestBodyDto {
    @IsValidFilename()
    @Length(1, 256)
    public readonly filename: string;

    @IsEnum(E_ProblemFileType)
    public readonly type: E_ProblemFileType;

    @Type(() => SignedUploadRequestDto)
    @ValidateNested()
    public readonly uploadRequest: ISignedUploadRequest;
}

// All the properties in this DTO will be sent to the client as JSON, do not include any sensitive information.
export class ProblemReportFileUploadFinishedResponseDto {
    public error?: CE_ProblemFileUploadError | CE_FileUploadError;
    public done?: true;
}

export const enum CE_ProblemFileUploadError {
    NoSuchProblem = CE_ExceptionString.NoSuchProblem,
    PermissionDenied = CE_ExceptionString.PermissionDenied,
    MinIOError = CE_ExceptionString.MinIOError,
    Data = "Data",
}
