import type { Response } from "express";

import type { IViewGlobal } from "./view";

export interface IResponse extends Response {
    locals: IViewGlobal;
}
