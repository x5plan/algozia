import { CE_UserLevel } from "./user-level";

export const enum CE_Permission {
    // Manage permissions
    ManageAll = CE_UserLevel.Admin,
    ManageUser = CE_UserLevel.Admin,
    ManageProblem = CE_UserLevel.Manager,

    // Access permissions
    AccessHomework = CE_UserLevel.Internal,
    AccessProblem = CE_UserLevel.General,
    AccessContest = CE_UserLevel.General,
    AccessSite = CE_UserLevel.General,

    // Special permissions
    // CreatePersonalProblem = CE_UserLevel.Paid,
    SubmitAnswer = CE_UserLevel.Paid,
}

export enum CE_SpecificPermission {
    Problem,
    Contest,
}
