import type { Request } from "express";

import type { ISession } from "./session";

export interface IRequest extends Request {
    session: ISession;
}
