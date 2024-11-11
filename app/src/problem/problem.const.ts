import { CE_ProblemJudgeTypeString, CE_ProblemTypeString } from "@/common/strings/problem";
import { CE_JudgeInfoCheckerType } from "@/problem-type/problem-type.enum";

import { E_ProblemType } from "./problem.type";

export const problemTypeStringMap: Record<E_ProblemType, string> = {
    [E_ProblemType.Traditional]: CE_ProblemTypeString.Traditional,
    [E_ProblemType.Interaction]: CE_ProblemTypeString.Interaction,
    [E_ProblemType.SubmitAnswer]: CE_ProblemTypeString.SubmitAnswer,
};

export const problemJudgeTypeStringMap: Record<CE_JudgeInfoCheckerType, string> = {
    [CE_JudgeInfoCheckerType.Integers]: CE_ProblemJudgeTypeString.Integers,
    [CE_JudgeInfoCheckerType.Floats]: CE_ProblemJudgeTypeString.Floats,
    [CE_JudgeInfoCheckerType.Lines]: CE_ProblemJudgeTypeString.Lines,
    [CE_JudgeInfoCheckerType.Binary]: CE_ProblemJudgeTypeString.Binary,
    [CE_JudgeInfoCheckerType.Custom]: CE_ProblemJudgeTypeString.Custom,
};
