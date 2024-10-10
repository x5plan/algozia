import type { CE_FileUploadError } from "./dto/file-upload-request.dto";
import type { FileEntity } from "./file.entity";

export interface ISignedUploadRequest {
    uuid: string;
    method: "POST" | "PUT";
    url: string;
    size: number;
    extraFormData?: unknown;
    fileFieldName?: string;
}

export interface IFileUploadReportResult {
    error?: CE_FileUploadError;
    file?: FileEntity;
}
