import { CE_ExceptionString } from "@/common/strings/exception";

import type { FileEntity } from "./file.entity";

export interface ISignedUploadRequest {
    uuid: string;
    method: "POST" | "PUT";
    url: string;
    size: number;
    signedIdAndSize: string;
    extraFormData?: unknown;
    fileFieldName?: string;
}

export interface IFileUploadReportResult {
    error?: CE_FileUploadError;
    file?: FileEntity;
}

export const enum CE_FileUploadError {
    FileUUIDExists = CE_ExceptionString.File_UUIDExists,
    FileNotFound = CE_ExceptionString.File_NoSuchFile,
    InvalidSignedData = CE_ExceptionString.File_InvalidSignedData,
}
