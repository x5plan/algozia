import { forwardRef, Inject, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { CE_Permission, CE_SpecificPermission } from "@/common/permission/permissions";
import { PermissionService } from "@/permission/permission.service";
import { UserEntity } from "@/user/user.entity";

import { CE_ProblemEditResponseError, type ProblemEditPostRequestBodyDto } from "./dto/problem-edit.dto";
import { ProblemEntity } from "./problem.entity";

@Injectable()
export class ProblemService {
    constructor(
        @InjectRepository(ProblemEntity)
        private readonly problemRepository: Repository<ProblemEntity>,
        @Inject(forwardRef(() => PermissionService))
        private readonly permissionService: PermissionService,
    ) {}

    public async findProblemByIdAsync(id: number) {
        return await this.problemRepository.findOne({ where: { id } });
    }

    public async findProblemByDisplayIdAsync(displayId: number) {
        return await this.problemRepository.findOne({ where: { displayId } });
    }

    public async updateProblemAsync(problem: ProblemEntity) {
        await this.problemRepository.save(problem);
    }

    public async generateNewDisplayIdAsync() {
        const problems = await this.problemRepository.find({
            order: {
                displayId: "DESC",
            },
            take: 1,
        });
        return problems.length > 0 ? problems[0].displayId + 1 : 1000;
    }

    public async editProblemAsync(
        problem: ProblemEntity,
        body: ProblemEditPostRequestBodyDto,
    ): Promise<CE_ProblemEditResponseError | null> {
        if (problem.displayId !== body.displayId) {
            if (await this.findProblemByDisplayIdAsync(body.displayId)) {
                return CE_ProblemEditResponseError.displayIdAlreadyExists;
            }
        }

        problem.displayId = body.displayId;
        problem.title = body.title;
        problem.description = body.description;
        problem.inputFormat = body.inputFormat;
        problem.outputFormat = body.outputFormat;
        problem.samples = body.samples;
        problem.visibility = body.visibility;

        return null;
    }

    public async checkIsAllowedViewAsync(problem: ProblemEntity, user: UserEntity) {
        if (this.checkIsAllowedEdit(user)) {
            return true;
        }

        if (
            !(await this.permissionService.checkSpecificPermissionAsync(
                CE_SpecificPermission.Problem,
                user,
                problem.id,
            ))
        ) {
            return false;
        }

        if (
            !this.permissionService.checkCommonPermission(CE_Permission.AccessProblem, user, true /* specificAllowed */)
        ) {
            return false;
        }

        return problem.visibility >= user.level;
    }

    public async checkIsAllowedSubmitAsync(problem: ProblemEntity, user: UserEntity) {
        if (!(await this.checkIsAllowedViewAsync(problem, user))) {
            return false;
        }

        return this.permissionService.checkCommonPermission(
            CE_Permission.SubmitAnswer,
            user,
            true /* specificAllowed */,
        );
    }

    public checkIsAllowedEdit(user: UserEntity) {
        return this.permissionService.checkCommonPermission(CE_Permission.ManageProblem, user);
    }
}
