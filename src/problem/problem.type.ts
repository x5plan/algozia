import { CE_UserLevel } from "@/common/permission/user-level";

export enum E_ProblemType {
    Traditional = "traditional",
    SubmitAnswer = "submit-answer",
    Interaction = "interaction",
}

export const enum CE_ProblemVisibility {
    Public = CE_UserLevel.General,
    Paid = CE_UserLevel.Paid,
    Internal = CE_UserLevel.Internal,
    Private = CE_UserLevel.Manager,
}

export interface IProblemEditable {
    displayId: number;
    title: string;
    description: string;
    inputFormat: string;
    outputFormat: string;
    samples: string;
    limitAndHint: string;
    visibility: CE_ProblemVisibility;
}

export interface IProblemJudgeInfoEditable {
    type: E_ProblemType;
    timeLimit?: number;
    memoryLimit?: number;
    fileIO?: boolean;
    inputFileName?: string;
    outputFileName?: string;
}

export enum E_ProblemSortBy {
    DisplayId = "displayId",
}

export type IProblemTypeStringMap = Record<E_ProblemType, string>;
export type IVisibilityStringMap = Record<CE_ProblemVisibility, string>;
export type IVisibilityLabelColorMap = Record<CE_ProblemVisibility, string>;

export interface IProblemViewGlobal {
    problemTypeStringMap: IProblemTypeStringMap;
    visibilityStringMap: IVisibilityStringMap;
    visibilityLabelColorMap: IVisibilityLabelColorMap;
}
