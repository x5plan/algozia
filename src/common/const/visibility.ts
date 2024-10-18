import { E_Visibility } from "@/permission/permission.enum";

import { CE_VisibilityString } from "../strings/common";

export const visibilityLabelColorMap: Record<E_Visibility, string> = {
    [E_Visibility.Private]: "red",
    [E_Visibility.Internal]: "violet",
    [E_Visibility.Paid]: "blue",
    [E_Visibility.Public]: "green",
};

export const visibilityStringMap: Record<E_Visibility, string> = {
    [E_Visibility.Private]: CE_VisibilityString.Private,
    [E_Visibility.Internal]: CE_VisibilityString.Internal,
    [E_Visibility.Paid]: CE_VisibilityString.Paid,
    [E_Visibility.Public]: CE_VisibilityString.Public,
};
