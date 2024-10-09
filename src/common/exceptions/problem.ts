import { HttpStatus } from "@nestjs/common";

import { CE_ExceptionString } from "../strings/exception";
import { CE_ProblemCommonString } from "../strings/problem";
import { AppHttpException } from "./common";

export class NoSuchProblemException extends AppHttpException {
    constructor() {
        super(CE_ExceptionString.NoSuchProblem, HttpStatus.NOT_FOUND);
    }
}

export class InvalidProblemJudgeInfo extends AppHttpException {
    constructor(validationMessage: string) {
        super(CE_ExceptionString.Problem_InvalidProblemJudgeInfo, HttpStatus.BAD_REQUEST, {
            description: validationMessage,
        });
    }
}

export class InvalidProblemTypeException extends AppHttpException {
    constructor() {
        super(CE_ExceptionString.Problem_InvalidProblemType, HttpStatus.BAD_REQUEST);
    }
}

export class NoSuchProblemFileException extends AppHttpException {
    constructor() {
        super(CE_ExceptionString.Problem_NoSuchProblemFile, HttpStatus.NOT_FOUND);
    }
}

export class TestDataRequiredException extends AppHttpException {
    constructor(problemId: number) {
        super(CE_ExceptionString.Problem_TestDataRequired, HttpStatus.BAD_REQUEST, {
            urls: [
                {
                    text: CE_ProblemCommonString.UploadTestData,
                    href: `/problem/${problemId}/file`,
                },
            ],
        });
    }
}
