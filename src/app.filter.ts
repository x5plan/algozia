import type { ArgumentsHost, ExceptionFilter } from "@nestjs/common";
import { Catch } from "@nestjs/common";

import { AppHttpException } from "@/common/exceptions/app-http.exception";

import { IResponseWithLocals } from "./common/types/view";

@Catch(AppHttpException)
export class AppExceptionFilter implements ExceptionFilter {
    public catch(exception: AppHttpException, host: ArgumentsHost) {
        host.switchToHttp()
            .getResponse<IResponseWithLocals>()
            .status(exception.getStatus())
            .render("error", exception.getResponse());
    }
}
