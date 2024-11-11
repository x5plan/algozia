import { E_CodeLanguage } from "@/code-language/code-language.type";

import { E_ProblemJudgeInfoCustomCheckerInterface } from "../problem-type.enum";
import { E_ProblemJudgeInfoScoringType } from "../problem-type.type";
import { E_ProblemJudgeInfoInteractionInteractorInterface } from "../problem-type-interaction.enum";

export function isValidCodeLanguage(language: unknown): language is E_CodeLanguage {
    return Object.values<unknown>(E_CodeLanguage).includes(language);
}

export function isValidScoringType(scoringType: unknown): scoringType is E_ProblemJudgeInfoScoringType {
    return Object.values<unknown>(E_ProblemJudgeInfoScoringType).includes(scoringType);
}

export function isValidCheckerInterface(interface_: unknown): interface_ is E_ProblemJudgeInfoCustomCheckerInterface {
    return Object.values<unknown>(E_ProblemJudgeInfoCustomCheckerInterface).includes(interface_);
}

export function isValidInteractorInterface(
    interface_: unknown,
): interface_ is E_ProblemJudgeInfoInteractionInteractorInterface {
    return Object.values<unknown>(E_ProblemJudgeInfoInteractionInteractorInterface).includes(interface_);
}
