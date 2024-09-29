import type { ExecutionContext } from "@nestjs/common";
import { createParamDecorator } from "@nestjs/common";

import type { IRequest } from "../types/request";

/**
 * See auth/auth.middleware.ts for request.session
 */
export const CurrentUser = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
    const request: IRequest = ctx.switchToHttp().getRequest();
    return request.session?.user || null;
});
