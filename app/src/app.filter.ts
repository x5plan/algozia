import type { ArgumentsHost, ExceptionFilter } from "@nestjs/common";
import { Catch } from "@nestjs/common";

import { AppHttpException } from "@/common/exceptions/common";
import { IResponse } from "@/common/types/response";

@Catch(AppHttpException)
export class AppExceptionFilter implements ExceptionFilter {
    public catch(exception: AppHttpException, host: ArgumentsHost) {
        host.switchToHttp()
            .getResponse<IResponse>()
            .status(exception.getStatus())
            .render("error", exception.getResponse());
    }
}
