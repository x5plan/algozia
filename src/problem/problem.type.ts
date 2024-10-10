import type { IProblemJudgeInfo } from "@/problem-type/problem-type.type";

import type { E_ProblemType, E_ProblemVisibility } from "./problem.enum";

export interface IProblemEditable {
    displayId: number;
    title: string;
    description: string;
    inputFormat: string;
    outputFormat: string;
    samples: string;
    limitAndHint: string;
    visibility: E_ProblemVisibility;
}

export interface IProblemJudgeInfoEditable {
    type: E_ProblemType;
    judgeInfo: IProblemJudgeInfo;
}

export type IProblemTypeStringMap = Record<E_ProblemType, string>;
export type IVisibilityStringMap = Record<E_ProblemVisibility, string>;
export type IVisibilityLabelColorMap = Record<E_ProblemVisibility, string>;

export interface IProblemViewGlobal {
    problemTypeStringMap: IProblemTypeStringMap;
    visibilityStringMap: IVisibilityStringMap;
    visibilityLabelColorMap: IVisibilityLabelColorMap;
}
