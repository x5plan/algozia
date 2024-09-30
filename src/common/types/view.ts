import type { IGlobalViewPermissions } from "@/permission/permission.type";
import type { UserEntity } from "@/user/user.entity";

import type { ViewUtils } from "../utils/view";

export interface IViewApp {
    appName: string;
    cdnUrl: string;
}

export type IViewGlobal<T extends object = object> = {
    app: IViewApp;
    activePage: string;
    currentUser: UserEntity | null;
    permissions: IGlobalViewPermissions;
    viewUtils: ViewUtils;
} & T;
