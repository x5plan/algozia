import { CE_ExceptionString } from "@/common/strings/exception";

import type { FileEntity } from "./file.entity";

export interface ISignedUploadRequest {
    uuid: string;
    method: "POST" | "PUT";
    url: string;
    token: string;
    extraFormData?: unknown;
    fileFieldName?: string;
}

export type IFileUploadReportResult = { error: CE_FileUploadError } | { error?: null; file: FileEntity };

export const enum CE_FileUploadError {
    FileUUIDExists = CE_ExceptionString.File_UUIDExists,
    FileNotFound = CE_ExceptionString.File_NoSuchFile,
    InvalidToken = CE_ExceptionString.File_InvalidToken,
}
