import type { visibilityLabelColorMap, visibilityStringMap } from "@/common/const/visibility";
import type { E_Visibility } from "@/permission/permission.enum";
import type { IProblemJudgeInfo } from "@/problem-type/problem-type.type";

import type { problemTypeStringMap } from "./problem.const";

export enum E_ProblemType {
    Traditional = "traditional",
    SubmitAnswer = "submit-answer",
    Interaction = "interaction",
}

export enum E_ProblemFileType {
    Testdata = "testdata",
    Additional = "additional",
}

export interface IProblemEditable {
    displayId: number;
    title: string;
    description: string;
    inputFormat: string;
    outputFormat: string;
    samples: string;
    limitAndHint: string;
    visibility: E_Visibility;
}

export interface IProblemJudgeInfoEditable {
    type: E_ProblemType;
    judgeInfo: IProblemJudgeInfo;
}

export enum E_ProblemSortBy {
    DisplayId = "displayId",
}

export interface IProblemViewGlobal {
    problemTypeStringMap: typeof problemTypeStringMap;
    visibilityStringMap: typeof visibilityStringMap;
    visibilityLabelColorMap: typeof visibilityLabelColorMap;
}
