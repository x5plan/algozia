import { Body, Controller, Get, Param, Post, Render, Res } from "@nestjs/common";
import type { Response } from "express";

import { CurrentUser } from "@/common/decorators/user.decorator";
import { AppLoginRequiredException, AppPermissionDeniedException } from "@/common/exceptions/common.exception";
import { NoSuchProblemException } from "@/common/exceptions/problem.exception";
import { CE_ProblemVisibilityString } from "@/common/strings/problem";
import { CE_Page } from "@/common/types/page";
import { UserEntity } from "@/user/user.entity";

import {
    IVisibilityStringMap,
    ProblemEditPostRequestBodyDto,
    ProblemEditRequestParamDto,
    ProblemEditResponseDto,
} from "./dto/problem-edit.dto";
import { ProblemEntity } from "./problem.entity";
import { ProblemService } from "./problem.service";
import { CE_ProblemVisibility } from "./problem.type";

@Controller(CE_Page.Problem)
export class ProblemController {
    constructor(private readonly problemService: ProblemService) {}

    @Get()
    @Render("problem")
    public getProblemList() {
        return {};
    }

    @Get(":id")
    @Render("problem-detail")
    public getProblemDetail() {
        return {};
    }

    @Get(":id/edit")
    @Render("problem-edit")
    public async getProblemEditAsync(
        @Param() param: ProblemEditRequestParamDto,
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
                visibilityStringMap: getVisibilityStringMap(),
            };
        } else {
            const problem = await this.problemService.findProblemByIdAsync(id);
            if (!problem) {
                throw new NoSuchProblemException();
            }

            return {
                isNewProblem: false,
                problem,
                visibilityStringMap: getVisibilityStringMap(),
            };
        }
    }

    @Post(":id/edit")
    @Render("problem-edit")
    public async postProblemEditAsync(
        @Param() param: ProblemEditRequestParamDto,
        @Body() body: ProblemEditPostRequestBodyDto,
        @Res() res: Response,
        @CurrentUser() currentUser: UserEntity | null,
    ): Promise<ProblemEditResponseDto> {
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
        } else {
            const p = await this.problemService.findProblemByIdAsync(id);
            if (!p) {
                throw new NoSuchProblemException();
            }
            problem = p;
        }

        const error = await this.problemService.editProblemAsync(problem, body);

        if (error) {
            return {
                error,
                isNewProblem,
                problem,
                visibilityStringMap: getVisibilityStringMap(),
            };
        }

        try {
            await this.problemService.updateProblemAsync(problem);
            res.redirect(`/problem/${problem.id}`);
        } catch (e) {
            throw e;
        }

        return {
            isNewProblem: false,
            problem,
            visibilityStringMap: getVisibilityStringMap(),
        };
    }
}

function getVisibilityStringMap(): IVisibilityStringMap {
    return {
        [CE_ProblemVisibility.Private]: CE_ProblemVisibilityString.Private,
        [CE_ProblemVisibility.Internal]: CE_ProblemVisibilityString.Internal,
        [CE_ProblemVisibility.Paid]: CE_ProblemVisibilityString.Paid,
        [CE_ProblemVisibility.Public]: CE_ProblemVisibilityString.Public,
    };
}
