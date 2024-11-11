import { IsEnum, IsNumber, IsString, Length } from "class-validator";

import { CE_ExceptionString } from "@/common/strings/exception";
import { IsValidFilename } from "@/common/validators/filename";
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

    @IsString()
    public readonly token: string;
}

// All the properties in this DTO will be sent to the client as JSON, do not include any sensitive information.
export class ProblemReportFileUploadFinishedResponseDto {
    public error?: CE_ProblemFileUploadError | CE_FileUploadError;
    public done?: true;
}

export const enum CE_ProblemFileUploadError {
    NoSuchProblem = CE_ExceptionString.NoSuchProblem,
    PermissionDenied = CE_ExceptionString.PermissionDenied,
    NotAllowedToSubmitFile = CE_ExceptionString.Problem_NotAllowedToSubmitFile,
    MinIOError = CE_ExceptionString.MinIOError,
    Data = "Data",
}
