import { CE_ProblemVisibilityString } from "@/common/strings/problem";

import type { IVisibilityLabelColorMap, IVisibilityStringMap } from "./problem.type";
import { CE_ProblemVisibility } from "./problem.type";

export function getVisibilityStringMap(): IVisibilityStringMap {
    return {
        [CE_ProblemVisibility.Private]: CE_ProblemVisibilityString.Private,
        [CE_ProblemVisibility.Internal]: CE_ProblemVisibilityString.Internal,
        [CE_ProblemVisibility.Paid]: CE_ProblemVisibilityString.Paid,
        [CE_ProblemVisibility.Public]: CE_ProblemVisibilityString.Public,
    };
}

export function getVisibilityLabelColorMap(): IVisibilityLabelColorMap {
    return {
        [CE_ProblemVisibility.Private]: "red",
        [CE_ProblemVisibility.Internal]: "violet",
        [CE_ProblemVisibility.Paid]: "blue",
        [CE_ProblemVisibility.Public]: "green",
    };
}
