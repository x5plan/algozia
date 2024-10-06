import { HttpStatus, type ValidationError } from "@nestjs/common";
import { HttpException } from "@nestjs/common";

import { CE_ExceptionString } from "../strings/exception";
import { CE_PageNameString } from "../strings/page-name";
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

export class AppPermissionDeniedException extends AppHttpException {
    constructor() {
        super(CE_ExceptionString.PermissionDenied, HttpStatus.FORBIDDEN);
    }
}

export class AppLoginRequiredException extends AppHttpException {
    constructor(currentUrl: string) {
        const url = encodeURIComponent(currentUrl);
        super(CE_ExceptionString.LoginRequired, HttpStatus.UNAUTHORIZED, {
            urls: [
                {
                    text: CE_PageNameString.Login,
                    href: `/auth/login?redirect=${url}`,
                },
                {
                    text: CE_PageNameString.Register,
                    href: `/auth/register?redirect=${url}`,
                },
            ],
        });
    }
}

export class AppDevelopingException extends AppHttpException {
    constructor() {
        super(CE_ExceptionString.Developing, HttpStatus.NOT_IMPLEMENTED);
    }
}
