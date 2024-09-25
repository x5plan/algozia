import { CE_UserLevel } from "./user-level";

export const enum CE_Permission {
    // Manage permissions
    ManageAll = CE_UserLevel.Admin,
    ManageUser = CE_UserLevel.Admin,
    ManageProblem = CE_UserLevel.Manager,

    // Access permissions
    AccessHomework = CE_UserLevel.Internal,
    AccessSite = CE_UserLevel.General,

    // Special permissions
    CreatePersonalProblem = CE_UserLevel.Paid,
}
