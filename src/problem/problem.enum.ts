import { CE_UserLevel } from "@/common/permission/user-level";

export enum E_ProblemType {
    Traditional = "traditional",
    SubmitAnswer = "submit-answer",
    Interaction = "interaction",
}

export enum E_ProblemVisibility {
    Public = CE_UserLevel.General,
    Paid = CE_UserLevel.Paid,
    Internal = CE_UserLevel.Internal,
    Private = CE_UserLevel.Manager,
}

export enum E_ProblemFileType {
    Testdata = "testdata",
    Additional = "additional",
}

export enum E_ProblemSortBy {
    DisplayId = "displayId",
}
