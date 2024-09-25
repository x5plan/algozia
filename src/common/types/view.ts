import type { Response } from "express";

import type { CE_Page } from "./page";

export interface IViewApp {
    appName: string;
    cdnUrl: string;
    utils?: unknown;
}

export interface IViewGlobal {
    app: IViewApp;
    activePage: CE_Page;
    currentUser?: unknown;
}

export type IResponseWithLocals = Response<unknown, IViewGlobal>;
