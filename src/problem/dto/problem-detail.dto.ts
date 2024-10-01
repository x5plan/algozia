import type { UserEntity } from "@/user/user.entity";

import type { ProblemEntity } from "../problem.entity";

export class ProblemDetailResponseDto {
    public problem: ProblemEntity;
    public uploader: UserEntity | null;

    public isAllowedEdit: boolean;
    public isAllowedSubmit: boolean;
}
