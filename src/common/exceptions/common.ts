import { HttpStatus, type ValidationError } from "@nestjs/common";
import { HttpException } from "@nestjs/common";

import { CE_ExceptionString } from "../strings/exception";
import type { IErrorOptions } from "../types/error-options";

export interface IErrorResponseBody extends Required<IErrorOptions> {
    message: string;
}

export class AppHttpException extends HttpException {
    constructor(message: string, status: HttpStatus, options?: IErrorOptions) {
        const responseBody: IErrorResponseBody = {
            message,
            description: "",
            showBack: true,
            urls: [],
            ...options,
        };

        super(responseBody, status);
    }

    public getResponse() {
        return super.getResponse() as IErrorResponseBody;
    }
}

export class AppValidationException extends AppHttpException {
    constructor(errors: ValidationError[]) {
        const validationMessages: string[] = [];
        AppValidationException.getValidationMessages(errors, validationMessages);

        super(CE_ExceptionString.ValidationError, HttpStatus.BAD_REQUEST, {
            description: validationMessages.join("\n"),
        });
    }

    private static getValidationMessages(errors: ValidationError[], results: string[], path = ""): void {
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
                AppValidationException.getValidationMessages(error.children, results, curPath);
            }
        }
    }
}

export class AppDevelopingException extends AppHttpException {
    constructor() {
        super(CE_ExceptionString.Developing, HttpStatus.NOT_IMPLEMENTED);
    }
}
