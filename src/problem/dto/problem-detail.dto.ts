import type { UserEntity } from "@/user/user.entity";

import type { ProblemEntity } from "../problem.entity";
import type { IVisibilityLabelColorMap, IVisibilityStringMap } from "./problem-shared.dto";

export class ProblemDetailResponseDto {
    public problem: ProblemEntity;
    public uploader: UserEntity | null;

    public isAllowedEdit: boolean;
    public isAllowedSubmit: boolean;

    public visibilityStringMap: IVisibilityStringMap;
    public visibilityLabelColorMap: IVisibilityLabelColorMap;
}
