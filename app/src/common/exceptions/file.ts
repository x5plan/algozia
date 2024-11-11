import { HttpStatus } from "@nestjs/common";

import type { CE_FileUploadError } from "@/file/file.type";

import { AppHttpException } from "./common";

export class FileUploadException extends AppHttpException {
    constructor(message: CE_FileUploadError) {
        super(message, HttpStatus.BAD_REQUEST);
    }
}
