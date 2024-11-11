import { Injectable, NestMiddleware } from "@nestjs/common";

import { VISIBILITY_LABEL_COLOR_MAP, VISIBILITY_STRING_MAP } from "@/common/const/visibility";
import { IRequest } from "@/common/types/request";
import { IResponse } from "@/common/types/response";

import { problemJudgeTypeStringMap, problemTypeStringMap } from "./problem.const";
import { IProblemViewGlobal } from "./problem.type";

@Injectable()
export class ProblemMiddleware implements NestMiddleware {
    public use(req: IRequest, res: IResponse<IProblemViewGlobal>, next: () => void) {
        Object.assign(res.locals, this.getProblemViewGlobal());
        next();
    }

    private getProblemViewGlobal(): IProblemViewGlobal {
        return {
            problemTypeStringMap,
            problemJudgeTypeStringMap,
            visibilityStringMap: VISIBILITY_STRING_MAP,
            visibilityLabelColorMap: VISIBILITY_LABEL_COLOR_MAP,
        };
    }
}
