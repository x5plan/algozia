import { Injectable, NestMiddleware } from "@nestjs/common";
import type { Request } from "express";

import { ConfigService } from "@/config/config.service";

import { IResponseWithLocals, IViewApp, IViewGlobal } from "./common/types/view";

@Injectable()
export class AppMiddleware implements NestMiddleware {
    private readonly viewApp: IViewApp;

    constructor(private readonly configService: ConfigService) {
        this.viewApp = {
            appName: this.configService.config.appName,
            cdnUrl: this.parseCdnUrl(this.configService.config.cdnUrl),
        };
    }

    public use(req: Request, res: IResponseWithLocals, next: () => void) {
        res.locals = {
            ...res.locals,
            ...this.getViewGlobalVars(req, res),
        };

        next();
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    private getViewGlobalVars(req: Request, res: IResponseWithLocals): IViewGlobal {
        return {
            app: this.viewApp,
            activePage: req.path.split("/")[1],
        };
    }

    private parseCdnUrl(cndUrl?: string): string {
        if (!cndUrl) {
            return "/cdn/";
        }

        return cndUrl.endsWith("/") ? cndUrl : `${cndUrl}/`;
    }
}
