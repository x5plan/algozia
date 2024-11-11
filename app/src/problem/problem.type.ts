import type { VISIBILITY_LABEL_COLOR_MAP, VISIBILITY_STRING_MAP } from "@/common/const/visibility";
import type { E_Visibility } from "@/permission/permission.enum";
import type { IProblemJudgeInfo } from "@/problem-type/problem-type.type";

import type { problemJudgeTypeStringMap, problemTypeStringMap } from "./problem.const";

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
    info: IProblemJudgeInfo;
}

export enum E_ProblemSortBy {
    DisplayId = "displayId",
}

export interface IProblemViewGlobal {
    problemTypeStringMap: typeof problemTypeStringMap;
    problemJudgeTypeStringMap: typeof problemJudgeTypeStringMap;
    visibilityStringMap: typeof VISIBILITY_STRING_MAP;
    visibilityLabelColorMap: typeof VISIBILITY_LABEL_COLOR_MAP;
}
