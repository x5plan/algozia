import { HttpStatus, type ValidationError } from "@nestjs/common";

import { CE_ExceptionString } from "../strings/exception";
import { AppHttpException } from "./app-http.exception";

export class AppValidationException extends AppHttpException {
    constructor(errors: ValidationError[]) {
        const validationMessages: string[] = [];
        getValidationMessages(errors, validationMessages);

        super(CE_ExceptionString.ValidationError, HttpStatus.BAD_REQUEST, {
            description: validationMessages.join("\n"),
        });
    }
}

function getValidationMessages(errors: ValidationError[], results: string[], path = ""): void {
    for (const error of errors) {
        const curPath = path ? `${path}.${error.property}` : error.property;

        if (error.constraints) {
            for (const constraint of Object.values(error.constraints)) {
                if (constraint) {
                    results.push(`${curPath}: ${constraint}`);
                }
            }
        }

        if (error.children && error.children.length > 0) {
            getValidationMessages(error.children, results, curPath);
        }
    }
}
