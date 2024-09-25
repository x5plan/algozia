import { Injectable, NestMiddleware } from "@nestjs/common";
import type { Request } from "express";

import { CE_Page } from "@/common/types/page";
import { ConfigService } from "@/config/config.service";

import { IResponseWithLocals, IViewApp, IViewGlobal } from "./common/types/view";

@Injectable()
export class ViewMiddleware implements NestMiddleware {
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
            activePage: this.getActivePage(req.path),
        };
    }

    private parseCdnUrl(cndUrl?: string): string {
        if (!cndUrl) {
            return "/cdn/";
        }

        return cndUrl.endsWith("/") ? cndUrl : `${cndUrl}/`;
    }

    private getActivePage(path: string): CE_Page {
        const p = path.split("/")[1];
        switch (p) {
            case "":
            case "home":
            case "index":
                return CE_Page.Home;

            case "problem":
            case "problems":
                return CE_Page.Problem;

            case "contest":
            case "contests":
                return CE_Page.Contest;

            case "help":
                return CE_Page.Help;

            default:
                return CE_Page.Other;
        }
    }
}
