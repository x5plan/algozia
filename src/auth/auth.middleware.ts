import type { NestMiddleware } from "@nestjs/common";
import { Injectable } from "@nestjs/common";
import type { Request } from "express";

import { IResponseWithLocals } from "@/common/types/view";
import type { UserEntity } from "@/user/user.entity";

import { AuthSessionService } from "./auth-session.service";

export interface ISession {
    sessionKey?: string;
    sessionId?: number;
    user?: UserEntity;
}

export interface IRequestWithSession extends Request {
    session: ISession;
}

@Injectable()
export class AuthMiddleware implements NestMiddleware {
    constructor(private readonly authSessionService: AuthSessionService) {}

    public use(req: IRequestWithSession, res: IResponseWithLocals, next: () => void): void {
        const sessionKey = this.authSessionService.getCookieSessionKey(req);

        if (sessionKey) {
            this.authSessionService
                .accessSessionAsync(sessionKey)
                .then(([sessionId, user]) => {
                    if (sessionId && user) {
                        req.session = {
                            sessionKey,
                            sessionId,
                            user,
                        };
                        res.locals.currentUser = user;
                    } else {
                        this.authSessionService.clearCookieSessionKey(res);
                    }
                })
                .finally(() => next());
        } else {
            next();
        }
    }
}
