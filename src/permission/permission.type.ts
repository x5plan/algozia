import type { UserEntity } from "@/user/user.entity";

import type { CE_UserLevel } from "./permission.enum";

export interface IGlobalViewPermissions {
    showProblem: boolean;
    showHomework: boolean;
    showContest: boolean;
    showSubmission: boolean;
}

export type ExcludeLevel<T extends UserEntity, U extends CE_UserLevel> = T & { level: Exclude<T["level"], U> };

export type IUserEntityWithSpecificLevel = ExcludeLevel<UserEntity, Exclude<CE_UserLevel, CE_UserLevel.Specific>>;
export type IUserEntityWithoutSpecificLevel = ExcludeLevel<UserEntity, CE_UserLevel.Specific>;
