import type { Response } from "express";

import type { IViewGlobal } from "./view";

export interface IResponse<T extends object = object> extends Response {
    locals: IViewGlobal<T>;
}
