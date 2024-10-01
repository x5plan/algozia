import { forwardRef, Inject, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { CE_Permission, CE_SpecificPermission } from "@/common/permission/permissions";
import { CE_Order } from "@/common/types/order";
import { ConfigService } from "@/config/config.service";
import { PermissionService } from "@/permission/permission.service";
import { UserEntity } from "@/user/user.entity";

import { CE_ProblemEditResponseError, type ProblemEditPostRequestBodyDto } from "./dto/problem-edit.dto";
import { ProblemEntity } from "./problem.entity";
import { CE_ProblemVisibility } from "./problem.type";

@Injectable()
export class ProblemService {
    constructor(
        @InjectRepository(ProblemEntity)
        private readonly problemRepository: Repository<ProblemEntity>,
        @Inject(forwardRef(() => PermissionService))
        private readonly permissionService: PermissionService,
        private readonly configService: ConfigService,
    ) {}

    public async findProblemByIdAsync(id: number) {
        return await this.problemRepository.findOne({ where: { id } });
    }

    public async findProblemByDisplayIdAsync(displayId: number) {
        return await this.problemRepository.findOne({ where: { displayId } });
    }

    public async findProblemListAndCountAsync(
        page: number,
        sortBy: "displayId",
        order: CE_Order,
        keyword: string,
        user: UserEntity,
    ): Promise<{
        problems: ProblemEntity[];
        count: number;
    }> {
        const takeCount = this.configService.config.pagination.problem;

        const qb = this.problemRepository.createQueryBuilder("problem");

        if (this.permissionService.isSpecificUser(user)) {
            const specificProblemIds = await this.permissionService.findSpecificPermissionSourceIdsAsync(
                CE_SpecificPermission.Problem,
                user,
            );

            qb.where("problem.id IN (:...specificProblemIds)", { specificProblemIds });
        } else {
            qb.where("problem.visibility <= :level", { level: user.level });
        }

        if (keyword) {
            qb.andWhere((subQb) => {
                subQb.where("problem.title LIKE :keyword", { keyword: `%${keyword}%` });

                if (Number.isInteger(Number(keyword))) {
                    subQb.orWhere("problemSub.displayId = :displayId", { displayId: Number(keyword) });
                }
            });
        }

        qb.orderBy(`problem.${sortBy}`, order)
            .skip((page - 1) * takeCount)
            .take(takeCount);

        const [problems, count] = await qb.getManyAndCount();

        return { problems, count };
    }

    public async updateProblemAsync(problem: ProblemEntity) {
        await this.problemRepository.save(problem);
    }

    public async deleteProblemAsync(problem: ProblemEntity) {
        await this.problemRepository.remove(problem);
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
        problem.limitAndHint = body.limitAndHint;

        if (problem.visibility === CE_ProblemVisibility.Private && body.visibility !== CE_ProblemVisibility.Private) {
            problem.publicTime = new Date();
        }
        problem.visibility = body.visibility;

        return null;
    }

    public async checkIsAllowedViewAsync(problem: ProblemEntity, user: UserEntity) {
        // If the user has permission to edit the problem, they are allowed to view it.
        if (this.checkIsAllowedEdit(user)) {
            return true;
        }

        // If the user is a specific permission user,
        // and they don't have the specific permission to view the problem,
        // they are not allowed to view the problem.
        if (this.permissionService.isSpecificUser(user)) {
            return await this.permissionService.checkSpecificPermissionAsync(
                CE_SpecificPermission.Problem,
                user,
                problem.id,
            );
        }

        // If the user is a common permission user,
        // and they don't have the common permission to view the problem,
        // they are not allowed to view the problem.
        if (!this.permissionService.checkCommonPermission(CE_Permission.AccessProblem, user)) {
            return false;
        }

        // If the user's level is lower than the problem's visibility level,
        // they are not allowed to view the problem.
        return problem.visibility >= user.level;
    }

    public async checkIsAllowedSubmitAsync(problem: ProblemEntity, user: UserEntity) {
        // If the user is not allowed to view the problem,
        // they are not allowed to submit answers.
        if (!(await this.checkIsAllowedViewAsync(problem, user))) {
            return false;
        }

        // If specific permission users are allowed to view the problem,
        // they are allowed to submit answers. So set specificAllowed to true.
        // The common permission users are not allowed to submit answers by default,
        // unless they have the SubmitAnswer permission.
        return this.permissionService.checkCommonPermission(
            CE_Permission.SubmitAnswer,
            user,
            true /* specificAllowed */,
        );
    }

    public checkIsAllowedEdit(user: UserEntity) {
        // If the user is not allowed to manage problems,
        // they are not allowed to edit problems.
        return this.permissionService.checkCommonPermission(CE_Permission.ManageProblem, user);
    }
}
