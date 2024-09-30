import { Injectable, NestMiddleware } from "@nestjs/common";

import { IRequest } from "@/common/types/request";
import { IResponse } from "@/common/types/response";

import { IProblemViewGlobal } from "./problem.type";
import { getVisibilityLabelColorMap, getVisibilityStringMap } from "./problem.util";

@Injectable()
export class ProblemMiddleware implements NestMiddleware {
    public use(req: IRequest, res: IResponse<IProblemViewGlobal>, next: () => void) {
        Object.assign(res.locals, this.getProblemViewGlobal());
        next();
    }

    private getProblemViewGlobal(): IProblemViewGlobal {
        return {
            visibilityStringMap: getVisibilityStringMap(),
            visibilityLabelColorMap: getVisibilityLabelColorMap(),
        };
    }
}
