import { CE_ExceptionString } from "@/common/strings/exception";

import type { FileEntity } from "./file.entity";

export interface ISharedOssClient {
    initAsync(): Promise<void>;
    fileExistsAsync(uuid: string, inTempBucket: boolean): Promise<boolean>;
    moveTempFileToBucketAsync(uuid: string): Promise<void>;
    deleteFileAsync(uuid: string | string[]): Promise<void>;
    deleteUnfinishedUploadedFile(uuid: string): void;
    signUploadRequestAsync(
        uuid: string,
        size: number,
        expire: number,
        noTemp: boolean,
        signedIdAndSize: string,
        urlReplacer: (url: string) => string,
    ): Promise<ISignedUploadRequest>;
    signDownloadUrlAsync(
        uuid: string,
        expire: number,
        downloadFilename?: string | null,
        urlReplacer?: ((url: string) => string) | null,
    ): Promise<string>;
}

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
