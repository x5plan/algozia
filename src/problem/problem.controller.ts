import { Body, Controller, Get, Param, Post, Query, Render, Req, Res } from "@nestjs/common";

import { CurrentUser } from "@/common/decorators/user.decorator";
import { AppLoginRequiredException, AppPermissionDeniedException } from "@/common/exceptions/common.exception";
import { NoSuchProblemException } from "@/common/exceptions/problem.exception";
import { CE_Permission, CE_SpecificPermission } from "@/common/permission/permissions";
import { CE_Order } from "@/common/types/order";
import { CE_Page } from "@/common/types/page";
import { IRequest } from "@/common/types/request";
import { IResponse } from "@/common/types/response";
import { ConfigService } from "@/config/config.service";
import { PermissionService } from "@/permission/permission.service";
import { UserEntity } from "@/user/user.entity";

import { ProblemDetailResponseDto } from "./dto/problem-detail.dto";
import { ProblemEditPostRequestBodyDto, ProblemEditResponseDto } from "./dto/problem-edit.dto";
import { ProblemListGetRequestQueryDto, ProblemListGetResponseDto } from "./dto/problem-list.dto";
import { ProblemBasicRequestParamDto } from "./dto/problem-shared.dto";
import { ProblemEntity } from "./problem.entity";
import { ProblemService } from "./problem.service";
import { CE_ProblemVisibility } from "./problem.type";

@Controller(CE_Page.Problem)
export class ProblemController {
    constructor(
        private readonly problemService: ProblemService,
        private readonly permissionService: PermissionService,
        private readonly configService: ConfigService,
    ) {}

    @Get()
    @Render("problem-list")
    public async getProblemListAsync(
        @Req() req: IRequest,
        @Query() query: ProblemListGetRequestQueryDto,
        @CurrentUser() currentUser: UserEntity | null,
    ): Promise<ProblemListGetResponseDto> {
        const { page = 1, sortBy = "displayId", order = CE_Order.Asc, keyword = "" } = query;

        if (!currentUser) {
            throw new AppLoginRequiredException(req.url);
        }

        if (this.permissionService.isSpecificUser(currentUser)) {
            if (
                !(await this.permissionService.checkSpecificPermissionAsync(CE_SpecificPermission.Problem, currentUser))
            ) {
                throw new AppPermissionDeniedException();
            }
        } else {
            if (!this.permissionService.checkCommonPermission(CE_Permission.Problem, currentUser)) {
                throw new AppPermissionDeniedException();
            }
        }

        const { problems, count } = await this.problemService.findProblemListAndCountAsync(
            page,
            sortBy,
            order,
            keyword,
            currentUser,
        );

        const pageCount = Math.max(Math.ceil(count / this.configService.config.pagination.problem), 1);

        return {
            problems,
            pageCount,
            currentPage: Math.min(page, pageCount),
            sortBy,
            order,
        };
    }

    @Get(":id")
    @Render("problem-detail")
    public async getProblemDetailAsync(
        @Param() param: ProblemBasicRequestParamDto,
        @CurrentUser() currentUser: UserEntity | null,
    ): Promise<ProblemDetailResponseDto> {
        const { id } = param;

        if (!currentUser) {
            throw new AppLoginRequiredException(`/problem/${id}/edit`);
        }

        const problem = await this.problemService.findProblemByIdAsync(id);
        if (!problem) {
            throw new NoSuchProblemException();
        }

        if (!(await this.problemService.checkIsAllowedViewAsync(problem, currentUser))) {
            throw new AppPermissionDeniedException();
        }

        return {
            problem,
            uploader: await problem.uploaderPromise,
            isAllowedEdit: this.problemService.checkIsAllowedEdit(currentUser),
            isAllowedSubmit: await this.problemService.checkIsAllowedSubmitAsync(problem, currentUser),
        };
    }

    @Get(":id/edit")
    @Render("problem-edit")
    public async getProblemEditAsync(
        @Param() param: ProblemBasicRequestParamDto,
        @CurrentUser() currentUser: UserEntity | null,
    ): Promise<ProblemEditResponseDto> {
        const { id } = param;

        if (!currentUser) {
            throw new AppLoginRequiredException(`/problem/${id}/edit`);
        }

        if (!this.problemService.checkIsAllowedEdit(currentUser)) {
            throw new AppPermissionDeniedException();
        }

        if (id === 0) {
            return {
                isNewProblem: true,
                problem: {
                    displayId: await this.problemService.generateNewDisplayIdAsync(),
                    title: "",
                    description: "",
                    inputFormat: "",
                    outputFormat: "",
                    samples: "",
                    limitAndHint: "",
                    visibility: CE_ProblemVisibility.Private,
                },
            };
        } else {
            const problem = await this.problemService.findProblemByIdAsync(id);
            if (!problem) {
                throw new NoSuchProblemException();
            }

            return {
                isNewProblem: false,
                problem,
            };
        }
    }

    @Post(":id/edit")
    public async postProblemEditAsync(
        @Param() param: ProblemBasicRequestParamDto,
        @Body() body: ProblemEditPostRequestBodyDto,
        @Res() res: IResponse,
        @CurrentUser() currentUser: UserEntity | null,
    ): Promise<void> {
        const render = (options: ProblemEditResponseDto) => res.render("problem-edit", options);
        const redirect = (id: number) => res.redirect(`/problem/${id}`);

        const { id } = param;

        if (!currentUser) {
            throw new AppLoginRequiredException(`/problem/${id}/edit`);
        }

        if (!this.problemService.checkIsAllowedEdit(currentUser)) {
            throw new AppPermissionDeniedException();
        }

        const isNewProblem = id === 0;
        let problem: ProblemEntity;

        if (isNewProblem) {
            problem = new ProblemEntity();
            problem.uploadTime = new Date();
            problem.uploaderId = currentUser.id;
        } else {
            const p = await this.problemService.findProblemByIdAsync(id);
            if (!p) {
                throw new NoSuchProblemException();
            }
            problem = p;
        }

        const error = await this.problemService.editProblemAsync(problem, body);

        if (error) {
            return render({
                error,
                isNewProblem,
                problem,
            });
        }

        await this.problemService.updateProblemAsync(problem);
        redirect(problem.id);
    }

    @Post(":id/delete")
    public async deleteProblemAsync(
        @Param() param: ProblemBasicRequestParamDto,
        @Res() res: IResponse,
        @CurrentUser() currentUser: UserEntity | null,
    ) {
        if (!currentUser || !this.problemService.checkIsAllowedEdit(currentUser)) {
            throw new AppPermissionDeniedException();
        }

        const problem = await this.problemService.findProblemByIdAsync(param.id);
        if (!problem) {
            throw new NoSuchProblemException();
        }

        await this.problemService.deleteProblemAsync(problem);

        res.redirect("/problem");
    }
}
