import { HttpStatus } from "@nestjs/common";

import { CE_ExceptionString } from "../strings/exception";
import { AppHttpException } from "./common.exception";

export class NoSuchProblemException extends AppHttpException {
    constructor() {
        super(CE_ExceptionString.NoSuchProblem, HttpStatus.NOT_FOUND);
    }
}
