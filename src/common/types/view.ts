import type { Response } from "express";

import type { UserEntity } from "@/user/user.entity";

export interface IViewApp {
    appName: string;
    cdnUrl: string;
    utils?: unknown;
}

export interface IViewGlobal {
    app: IViewApp;
    activePage: string;
    currentUser?: UserEntity; // set in AuthMiddleware
}

export type IResponseWithLocals = Response<unknown, IViewGlobal>;
