import { HttpStatus } from "@nestjs/common";

import { CE_ExceptionString } from "../strings/exception";
import { AppHttpException } from "./app-http.exception";

export class AppDevelopingException extends AppHttpException {
    constructor() {
        super(CE_ExceptionString.Developing, HttpStatus.NOT_IMPLEMENTED);
    }
}
