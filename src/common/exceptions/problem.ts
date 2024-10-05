import { HttpStatus } from "@nestjs/common";

import { CE_ExceptionString } from "../strings/exception";
import { AppHttpException } from "./common";

export class NoSuchProblemException extends AppHttpException {
    constructor() {
        super(CE_ExceptionString.NoSuchProblem, HttpStatus.NOT_FOUND);
    }
}

export class InvalidFileIONameException extends AppHttpException {
    constructor() {
        super(CE_ExceptionString.Problem_InvalidFileIOName, HttpStatus.BAD_REQUEST);
    }
}

export class InvalidTimeOrMemoryLimitException extends AppHttpException {
    constructor() {
        super(CE_ExceptionString.Problem_InvalidTimeOrMemoryLimit, HttpStatus.BAD_REQUEST);
    }
}

export class InvalidProblemTypeException extends AppHttpException {
    constructor() {
        super(CE_ExceptionString.Problem_InvalidProbelemType, HttpStatus.BAD_REQUEST);
    }
}
