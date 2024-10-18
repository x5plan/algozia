import { HttpStatus } from "@nestjs/common";

import { CE_PageNameString } from "../strings/common";
import { CE_ExceptionString } from "../strings/exception";
import { AppHttpException } from "./common";

export class LoginRequiredException extends AppHttpException {
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
