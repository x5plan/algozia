import type { HttpStatus } from "@nestjs/common";
import { HttpException } from "@nestjs/common";

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
