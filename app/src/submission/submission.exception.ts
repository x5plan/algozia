import { HttpStatus } from "@nestjs/common";

import { AppHttpException } from "@/common/exceptions/common";
import { CE_ExceptionString } from "@/common/strings/exception";

export class NoSuchSubmissionException extends AppHttpException {
    constructor() {
        super(CE_ExceptionString.Submission_NoSuchSubmission, HttpStatus.NOT_FOUND);
    }
}
