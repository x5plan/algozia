import { Body, Controller, Get, Logger, Param, Post, Query, Redirect, Render, Req, Res } from "@nestjs/common";

import { CurrentUser } from "@/common/decorators/user.decorator";
import { AppLoginRequiredException, AppPermissionDeniedException } from "@/common/exceptions/common";
import { NoSuchProblemException, NoSuchProblemFileException } from "@/common/exceptions/problem";
import { CE_Permission, CE_SpecificPermission } from "@/common/permission/permissions";
import { CE_Order } from "@/common/types/order";
import { CE_Page } from "@/common/types/page";
import { IRequest } from "@/common/types/request";
import { IResponse } from "@/common/types/response";
import { ConfigService } from "@/config/config.service";
import { FileService } from "@/file/file.service";
import { PermissionService } from "@/permission/permission.service";
import { CE_LockType } from "@/redis/lock.type";
import { UserEntity } from "@/user/user.entity";

import { ProblemDetailResponseDto } from "./dto/problem-detail.dto";
import { ProblemEditPostRequestBodyDto, ProblemEditResponseDto } from "./dto/problem-edit.dto";
import { ProblemEditJudgePostRequestBodyDto, ProblemEditJudgeResponseDto } from "./dto/problem-edit-judge.dto";
import { ProblemFileDownloadRequestParamDto, ProblemFileItemDto, ProblemFileResponseDto } from "./dto/problem-file.dto";
import {
    CE_ProblemFileUploadError,
    ProblemReportFileUploadFinishedPostRequestBodyDto,
    ProblemReportFileUploadFinishedResponseDto,
    ProblemSignFileUploadRequestPostRequestBodyDto,
    ProblemSignFileUploadRequestResponseDto,
} from "./dto/problem-file-api.dto";
import { ProblemListGetRequestQueryDto, ProblemListGetResponseDto } from "./dto/problem-list.dto";
import { ProblemBasicRequestParamDto } from "./dto/problem-shared.dto";
import { ProblemEntity } from "./problem.entity";
import { ProblemService } from "./problem.service";
import { CE_ProblemVisibility, E_ProblemType } from "./problem.type";
import { ProblemJudgeInfoEntity } from "./problem-judge-info.entity";

@Controller(CE_Page.Problem)
export class ProblemController {
    constructor(
        private readonly problemService: ProblemService,
        private readonly permissionService: PermissionService,
        private readonly fileService: FileService,
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

        const allowedManageProblem = this.permissionService.checkCommonPermission(
            CE_Permission.ManageProblem,
            currentUser,
        );

        return {
            problems,
            pageCount,
            keyword,
            currentPage: Math.min(page, pageCount),
            sortBy,
            order,
            allowedManageProblem,
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
            throw new AppLoginRequiredException(`/problem/${id}`);
        }

        const problem = await this.problemService.findProblemByIdAsync(id);
        if (!problem) {
            throw new NoSuchProblemException();
        }

        if (!(await this.problemService.checkIsAllowedViewAsync(problem, currentUser))) {
            throw new AppPermissionDeniedException();
        }

        const hasAdditionalFiles = (await this.problemService.countProblemAdditionalFilesAsync(problem)) > 0;

        return {
            problem,
            hasAdditionalFiles,
            judgeInfo: await problem.judgeInfoPromise,
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

    @Get(":id/edit/judge")
    @Render("problem-edit-judge")
    public async getProblemEditJudgeAsync(
        @Param() param: ProblemBasicRequestParamDto,
        @CurrentUser() currentUser: UserEntity | null,
    ): Promise<ProblemEditJudgeResponseDto> {
        const { id } = param;

        if (!currentUser) {
            throw new AppLoginRequiredException(`/problem/${id}/edit/judge`);
        }

        if (!this.problemService.checkIsAllowedEdit(currentUser)) {
            throw new AppPermissionDeniedException();
        }

        const problem = await this.problemService.findProblemByIdAsync(id);

        if (!problem) {
            throw new NoSuchProblemException();
        }

        let judgeInfo = await problem.judgeInfoPromise;

        if (!judgeInfo) {
            judgeInfo = new ProblemJudgeInfoEntity();
            judgeInfo.type = E_ProblemType.Traditional;
            judgeInfo.timeLimit = 1000;
            judgeInfo.memoryLimit = 256;
            judgeInfo.fileIO = false;
        }

        return {
            hasSubmissions: false,
            problem,
            judgeInfo,
        };
    }

    @Post(":id/edit/judge")
    @Redirect()
    public async postProblemEditJudgeAsync(
        @Param() param: ProblemBasicRequestParamDto,
        @Body() body: ProblemEditJudgePostRequestBodyDto,
        @CurrentUser() currentUser: UserEntity | null,
    ) {
        const { id } = param;

        if (!currentUser) {
            throw new AppLoginRequiredException(`/problem/${id}/edit/judge`);
        }

        if (!this.problemService.checkIsAllowedEdit(currentUser)) {
            throw new AppPermissionDeniedException();
        }

        return await this.problemService.lockProblemByIdAsync(id, CE_LockType.Write, async (problem) => {
            if (!problem) throw new NoSuchProblemException();

            let judgeInfo = await problem.judgeInfoPromise;

            if (!judgeInfo) {
                judgeInfo = new ProblemJudgeInfoEntity();
                judgeInfo.problemId = problem.id;
            }

            this.problemService.editJudgeInfo(judgeInfo, body);

            await this.problemService.updateJudgeInfoAsync(judgeInfo);

            return { url: `/problem/${problem.id}` };
        });
    }

    @Get(":id/edit/data")
    @Render("problem-edit-data")
    public async getProblemEditDataAsync() {
        return {};
    }

    @Get(":id/file")
    @Render("problem-file")
    public async getProblemFileAsync(
        @Param() param: ProblemBasicRequestParamDto,
        @CurrentUser() currentUser: UserEntity | null,
    ): Promise<ProblemFileResponseDto> {
        const { id } = param;

        if (!currentUser) {
            throw new AppLoginRequiredException(`/problem/${id}/file`);
        }

        const problem = await this.problemService.findProblemByIdAsync(id);
        if (!problem) throw new NoSuchProblemException();

        if (!(await this.problemService.checkIsAllowedViewAsync(problem, currentUser))) {
            throw new AppPermissionDeniedException();
        }

        const problemFiles = await this.problemService.findProblemAdditionalFilesAsync(problem);

        const isAllowedEdit = this.problemService.checkIsAllowedEdit(currentUser);
        if (!isAllowedEdit && !problemFiles.length) throw new NoSuchProblemFileException();

        const files = await Promise.all(
            problemFiles.map(
                async (file): Promise<ProblemFileItemDto> => ({
                    filename: file.filename,
                    size: (await this.fileService.findFileByUUIDAsync(file.uuid))?.size ?? 0,
                    uuid: file.uuid,
                }),
            ),
        );

        return {
            problem,
            files,
            isAllowedEdit,
        };
    }

    @Get(":id/file/:fileId")
    @Redirect()
    public async getProblemFileDownloadAsync(
        @Param() param: ProblemFileDownloadRequestParamDto,
        @CurrentUser() currentUser: UserEntity | null,
    ) {
        const { id, fileId } = param;

        if (!currentUser) {
            throw new AppLoginRequiredException(`/problem/${id}/file/${fileId}`);
        }

        const problem = await this.problemService.findProblemByIdAsync(id);
        if (!problem) throw new NoSuchProblemException();

        if (!(await this.problemService.checkIsAllowedViewAsync(problem, currentUser))) {
            throw new AppPermissionDeniedException();
        }

        const file = await this.problemService.findProblemAdditionalFileByUUIDAsync(problem, fileId);
        if (!file) throw new NoSuchProblemFileException();

        const downloadUrl = await this.fileService.signDownloadUrlAsync(file.uuid, file.filename);

        return { url: downloadUrl };
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

    @Post(":id/signFileUploadRequest")
    public async postSignFileUploadRequestAsync(
        @Param() param: ProblemBasicRequestParamDto,
        @Body() body: ProblemSignFileUploadRequestPostRequestBodyDto,
        @CurrentUser() currentUser: UserEntity | null,
    ): Promise<ProblemSignFileUploadRequestResponseDto> {
        if (!currentUser || !this.problemService.checkIsAllowedEdit(currentUser)) {
            return { error: CE_ProblemFileUploadError.PermissionDenied };
        }

        const problem = await this.problemService.findProblemByIdAsync(param.id);
        if (!problem) {
            return { error: CE_ProblemFileUploadError.NoSuchProblem };
        }

        try {
            const uploadRequest = await this.fileService.signUploadRequestAsync(body.size);
            return { uploadRequest };
        } catch (e) {
            Logger.error(`Failed to sign upload request for problem "${problem.id}": ${e}`);
            return { error: CE_ProblemFileUploadError.MinIOError };
        }
    }

    @Post(":id/reportFileUploadFinished")
    public async postReportFileUploadFinishedAsync(
        @Param() param: ProblemBasicRequestParamDto,
        @Body() body: ProblemReportFileUploadFinishedPostRequestBodyDto,
        @CurrentUser() currentUser: UserEntity | null,
    ): Promise<ProblemReportFileUploadFinishedResponseDto> {
        if (!currentUser || !this.problemService.checkIsAllowedEdit(currentUser)) {
            return { error: CE_ProblemFileUploadError.PermissionDenied };
        }

        return await this.problemService.lockManageFileByProblemIdAsync(param.id, body.type, async (problem) => {
            if (!problem) {
                return { error: CE_ProblemFileUploadError.NoSuchProblem };
            }
            const error = await this.problemService.addProblemFileAsync(
                problem,
                body.type,
                body.filename,
                body.uploadRequest,
            );

            if (error) {
                return { error };
            }

            return { done: true };
        });
    }
}
