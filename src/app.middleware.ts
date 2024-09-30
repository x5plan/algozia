import { Injectable, NestMiddleware } from "@nestjs/common";

import { AuthSessionService } from "@/auth/auth-session.service";
import { IRequest } from "@/common/types/request";
import { IResponse } from "@/common/types/response";
import { IViewApp, IViewGlobal } from "@/common/types/view";
import { ViewUtils } from "@/common/utils/view";
import { ConfigService } from "@/config/config.service";
import { PermissionService } from "@/permission/permission.service";
import { UserEntity } from "@/user/user.entity";

@Injectable()
export class AppMiddleware implements NestMiddleware {
    private readonly viewApp: IViewApp;

    constructor(
        private readonly configService: ConfigService,
        private readonly authSessionService: AuthSessionService,
        private readonly permissionService: PermissionService,
    ) {
        this.viewApp = {
            appName: this.configService.config.appName,
            cdnUrl: this.parseCdnUrl(this.configService.config.cdnUrl),
        };
    }

    public use(req: IRequest, res: IResponse, next: () => void) {
        this.getViewGlobalVarsAsync(req, res)
            .then((viewGlobal) => Object.assign(res.locals, viewGlobal))
            .finally(() => next());
    }

    private async getViewGlobalVarsAsync(req: IRequest, res: IResponse): Promise<IViewGlobal> {
        const currentUser = await this.processSessionAsync(req, res);
        const permissions = await this.permissionService.getGlobalViewPermissionsAsync(currentUser);

        return {
            app: this.viewApp,
            activePage: req.path.split("/")[1],
            currentUser: currentUser,
            permissions,
            viewUtils: new ViewUtils(req, res),
        };
    }

    private parseCdnUrl(cndUrl?: string): string {
        if (!cndUrl) {
            return "/cdn/";
        }

        return cndUrl.endsWith("/") ? cndUrl : `${cndUrl}/`;
    }

    private async processSessionAsync(req: IRequest, res: IResponse): Promise<UserEntity | null> {
        const sessionKey = this.authSessionService.getCookieSessionKey(req);

        if (sessionKey) {
            const [sessionId, user] = await this.authSessionService.accessSessionAsync(sessionKey);
            if (sessionId && user) {
                req.session = {
                    sessionKey,
                    sessionId,
                    user,
                };
                return user;
            } else {
                this.authSessionService.clearCookieSessionKey(res);
            }
        }

        return null;
    }
}
