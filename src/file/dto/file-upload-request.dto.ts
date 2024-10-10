import { IsIn, IsNumber, IsOptional, IsString, IsUUID } from "class-validator";

import { CE_ExceptionString } from "@/common/strings/exception";

import { ISignedUploadRequest } from "../file.type";

export class SignedUploadRequestDto implements ISignedUploadRequest {
    @IsUUID()
    public uuid: string;

    @IsIn(["POST", "PUT"])
    @IsOptional()
    public method: "POST" | "PUT";

    @IsString()
    @IsOptional()
    public url: string;

    @IsNumber()
    public size: number;

    @IsOptional()
    public extraFormData?: unknown;

    @IsString()
    @IsOptional()
    public fileFieldName?: string;
}

export const enum CE_FileUploadError {
    FileUUIDExists = CE_ExceptionString.File_UUIDExists,
    FileNotFound = CE_ExceptionString.File_NoSuchFile,
}
