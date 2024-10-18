import { CE_ProblemTypeString } from "@/common/strings/problem";

import { E_ProblemType } from "./problem.type";

export const problemTypeStringMap: Record<E_ProblemType, string> = {
    [E_ProblemType.Traditional]: CE_ProblemTypeString.Traditional,
    [E_ProblemType.Interaction]: CE_ProblemTypeString.Interaction,
    [E_ProblemType.SubmitAnswer]: CE_ProblemTypeString.SubmitAnswer,
};
