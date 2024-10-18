import { HttpStatus } from "@nestjs/common";

import { CE_ExceptionString } from "../strings/exception";
import { AppHttpException } from "./common";

export class PermissionDeniedException extends AppHttpException {
    constructor() {
        super(CE_ExceptionString.PermissionDenied, HttpStatus.FORBIDDEN);
    }
}
