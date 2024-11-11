import { Body, Controller, Get, Logger, Param, Post, Query, Redirect, Render, Req, Res } from "@nestjs/common";

import { CodeLanguageService } from "@/code-language/code-language.service";
import { CurrentUser } from "@/common/decorators/user.decorator";
import { LoginRequiredException } from "@/common/exceptions/auth";
import { PermissionDeniedException } from "@/common/exceptions/permission";
import {
    EmptyAnswerFileException,
    EmptyCodeException,
    InvalidLanguageOrCompileOptionsException,
    NoProblemJudgeInfoException,
    NoSuchProblemException,
    NoSuchProblemFileException,
    TestDataRequiredException,
} from "@/common/exceptions/problem";
import { CE_Order } from "@/common/types/order";
import { CE_Page } from "@/common/types/page";
import { IRequest } from "@/common/types/request";
import { IResponse } from "@/common/types/response";
import { ConfigService } from "@/config/config.service";
import { FileService } from "@/file/file.service";
import { CE_CommonPermission, CE_SpecificPermission } from "@/permission/permission.enum";
import { E_Visibility } from "@/permission/permission.enum";
import { PermissionService } from "@/permission/permission.service";
import { ProblemTypeService } from "@/problem-type/problem-type.service";
import { CE_LockType } from "@/redis/lock.type";
import { SubmissionEntity } from "@/submission/submission.entity";
import { SubmissionService } from "@/submission/submission.service";
import { UserEntity } from "@/user/user.entity";

import { ProblemDetailResponseDto } from "./dto/problem-detail.dto";
import { ProblemEditPostRequestBodyDto, ProblemEditResponseDto } from "./dto/problem-edit.dto";
import { ProblemEditJudgePostRequestBodyDto, ProblemEditJudgeResponseDto } from "./dto/problem-edit-judge.dto";
import {
    ProblemFileDeletePostRequestQueryDto,
    ProblemFileItemDto,
    ProblemFileRequestParamDto,
    ProblemFileResponseDto,
} from "./dto/problem-file.dto";
import {
    CE_ProblemFileUploadError,
    ProblemReportFileUploadFinishedPostRequestBodyDto,
    ProblemReportFileUploadFinishedResponseDto,
    ProblemSignFileUploadRequestPostRequestBodyDto,
    ProblemSignFileUploadRequestResponseDto,
} from "./dto/problem-file-api.dto";
import { ProblemListGetRequestQueryDto, ProblemListGetResponseDto } from "./dto/problem-list.dto";
import { ProblemBasicRequestParamDto } from "./dto/problem-shared.dto";
import { ProblemSubmitPostRequestBodyDto } from "./dto/problem-submit.dto";
import { ProblemEntity } from "./problem.entity";
import { ProblemService } from "./problem.service";
import { E_ProblemType } from "./problem.type";
import { ProblemJudgeInfoEntity } from "./problem-judge-info.entity";

@Controller(CE_Page.Problem)
export class ProblemController {
    constructor(
        private readonly problemService: ProblemService,
        private readonly problemTypeService: ProblemTypeService,
        private readonly permissionService: PermissionService,
        private readonly codeLanguageService: CodeLanguageService,
        private readonly submissionService: SubmissionService,
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
            throw new LoginRequiredException(req.url);
        }

        let allowedManageProblem = false;

        if (this.permissionService.isSpecificUser(currentUser.level)) {
            if (
                !(await this.permissionService.checkSpecificPermissionAsync(
                    CE_SpecificPermission.Problem,
                    currentUser,
                    currentUser.level,
                ))
            ) {
                throw new PermissionDeniedException();
            }
        } else {
            if (!this.permissionService.checkCommonPermission(CE_CommonPermission.AccessProblem, currentUser.level)) {
                throw new PermissionDeniedException();
            }

            allowedManageProblem = this.permissionService.checkCommonPermission(
                CE_CommonPermission.ManageProblem,
                currentUser.level,
            );
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
            throw new LoginRequiredException(`/problem/${id}`);
        }

        const problem = await this.problemService.findProblemByIdAsync(id);
        if (!problem) {
            throw new NoSuchProblemException();
        }

        if (!(await this.problemService.checkIsAllowedViewAsync(problem, currentUser))) {
            throw new PermissionDeniedException();
        }

        const hasAdditionalFiles = (await this.problemService.countProblemAdditionalFilesAsync(problem)) > 0;
        const hasTestdataFiles = (await this.problemService.countProblemTestdataFilesAsync(problem)) > 0;

        return {
            problem,
            hasAdditionalFiles,
            hasTestdataFiles,
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
            throw new LoginRequiredException(`/problem/${id}/edit`);
        }

        if (!this.problemService.checkIsAllowedEdit(currentUser)) {
            throw new PermissionDeniedException();
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
                    visibility: E_Visibility.Private,
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
            throw new LoginRequiredException(`/problem/${id}/edit`);
        }

        if (!this.problemService.checkIsAllowedEdit(currentUser)) {
            throw new PermissionDeniedException();
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
            throw new LoginRequiredException(`/problem/${id}/edit/judge`);
        }

        if (!this.problemService.checkIsAllowedEdit(currentUser)) {
            throw new PermissionDeniedException();
        }

        const problem = await this.problemService.findProblemByIdAsync(id);

        if (!problem) {
            throw new NoSuchProblemException();
        }

        const testDataFiles = await this.problemService.findProblemTestdataFilesAsync(problem);

        if (testDataFiles.length <= 0) {
            throw new TestDataRequiredException(problem.id);
        }

        let judgeInfo = await problem.judgeInfoPromise;

        if (!judgeInfo) {
            judgeInfo = new ProblemJudgeInfoEntity();
            judgeInfo.problemId = problem.id;
            judgeInfo.type = E_ProblemType.Traditional;
            judgeInfo.info = this.problemTypeService.get(judgeInfo.type).defaultJudgeInfo;
        }

        return {
            hasSubmissions: false,
            problem,
            judgeInfo,
            testDataFileNames: testDataFiles.map((file) => file.filename),
        };
    }

    @Post(":id/edit/judge")
    public async postProblemEditJudgeAsync(
        @Res() res: IResponse,
        @Param() param: ProblemBasicRequestParamDto,
        @Body() body: ProblemEditJudgePostRequestBodyDto,
        @CurrentUser() currentUser: UserEntity | null,
    ): Promise<void> {
        const { id } = param;
        const render = (options: ProblemEditJudgeResponseDto) => res.render("problem-edit-judge", options);
        const redirect = () => res.redirect(`/problem/${id}`);

        if (!currentUser) {
            throw new LoginRequiredException(`/problem/${id}/edit/judge`);
        }

        if (!this.problemService.checkIsAllowedEdit(currentUser)) {
            throw new PermissionDeniedException();
        }

        return await this.problemService.lockProblemByIdAsync(id, CE_LockType.Write, async (problem) => {
            if (!problem) throw new NoSuchProblemException();

            const testDataFiles = await this.problemService.findProblemTestdataFilesAsync(problem);

            if (testDataFiles.length <= 0) {
                throw new TestDataRequiredException(problem.id);
            }

            let judgeInfo = await problem.judgeInfoPromise;

            if (!judgeInfo) {
                judgeInfo = new ProblemJudgeInfoEntity();
                judgeInfo.problemId = problem.id;
            }

            const validationError = await this.problemService.editProblemJudgeInfoAsync(
                judgeInfo,
                body,
                problem,
                testDataFiles,
            );

            if (validationError) {
                // Save temporary judge info to next edit
                judgeInfo.info = body.info;
                render({
                    hasSubmissions: false,
                    problem,
                    judgeInfo,
                    testDataFileNames: testDataFiles.map((file) => file.filename),
                    error: validationError,
                });
            } else {
                await this.problemService.updateJudgeInfoAsync(judgeInfo);
                redirect();
            }
        });
    }

    @Get(":id/file")
    @Render("problem-file")
    public async getProblemFileAsync(
        @Param() param: ProblemBasicRequestParamDto,
        @CurrentUser() currentUser: UserEntity | null,
    ): Promise<ProblemFileResponseDto> {
        const { id } = param;

        if (!currentUser) {
            throw new LoginRequiredException(`/problem/${id}/file`);
        }

        const problem = await this.problemService.findProblemByIdAsync(id);
        if (!problem) throw new NoSuchProblemException();

        if (!(await this.problemService.checkIsAllowedViewAsync(problem, currentUser))) {
            throw new PermissionDeniedException();
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
                    type: file.type,
                }),
            ),
        );

        const testDataFiles = isAllowedEdit ? await this.problemService.findProblemTestdataFilesAsync(problem) : [];
        const testDatas = await Promise.all(
            testDataFiles.map(
                async (file): Promise<ProblemFileItemDto> => ({
                    filename: file.filename,
                    size: (await this.fileService.findFileByUUIDAsync(file.uuid))?.size ?? 0,
                    uuid: file.uuid,
                    type: file.type,
                }),
            ),
        );

        return {
            problem,
            files,
            testDatas,
            isAllowedEdit,
        };
    }

    @Get(":id/file/:fileId")
    @Redirect()
    public async getProblemFileDownloadAsync(
        @Param() param: ProblemFileRequestParamDto,
        @CurrentUser() currentUser: UserEntity | null,
    ) {
        const { id, fileId } = param;

        if (!currentUser) {
            throw new LoginRequiredException(`/problem/${id}/file/${fileId}`);
        }

        const problem = await this.problemService.findProblemByIdAsync(id);
        if (!problem) throw new NoSuchProblemException();

        if (!(await this.problemService.checkIsAllowedViewAsync(problem, currentUser))) {
            throw new PermissionDeniedException();
        }

        const file = await this.problemService.findProblemAdditionalFileByUUIDAsync(problem, fileId);
        if (!file) throw new NoSuchProblemFileException();

        const downloadUrl = await this.fileService.signDownloadUrlAsync(
            file.uuid,
            file.filename,
            true /* replaceUrl */,
        );

        return { url: downloadUrl };
    }

    @Post(":id/file/:fileId/delete")
    @Redirect()
    public async postProblemFileDeleteAsync(
        @Param() param: ProblemFileRequestParamDto,
        @Query() query: ProblemFileDeletePostRequestQueryDto,
        @CurrentUser() currentUser: UserEntity | null,
    ) {
        const { id, fileId } = param;
        const { type } = query;

        if (!currentUser || !this.problemService.checkIsAllowedEdit(currentUser)) {
            throw new PermissionDeniedException();
        }

        return await this.problemService.lockManageFileByProblemIdAsync(id, type, async (problem) => {
            if (!problem) throw new NoSuchProblemException();

            await this.problemService.deleteProblemFileAsync(problem, fileId);

            return {
                url: `/problem/${id}/file`,
            };
        });
    }

    @Post(":id/submit")
    @Redirect()
    public async postProblemSubmitAsync(
        @Param() param: ProblemBasicRequestParamDto,
        @Body() body: ProblemSubmitPostRequestBodyDto,
        @CurrentUser() currentUser: UserEntity | null,
    ) {
        const { id } = param;

        if (!currentUser) {
            throw new LoginRequiredException(`/problem/${id}/submit`);
        }

        return await this.problemService.lockProblemByIdAsync(id, CE_LockType.Read, async (problem) => {
            if (!problem) throw new NoSuchProblemException();
            if (!(await this.problemService.checkIsAllowedSubmitAsync(problem, currentUser))) {
                throw new PermissionDeniedException();
            }

            const judgeInfo = await problem.judgeInfoPromise;
            if (!judgeInfo) throw new NoProblemJudgeInfoException();

            let submission: SubmissionEntity;

            if (this.problemTypeService.get(judgeInfo.type).shouldUploadAnswerFile) {
                const { fileUploadToken } = body;
                if (!fileUploadToken) throw new EmptyAnswerFileException();
                submission = await this.submissionService.addFileSubmissionAsync(fileUploadToken, problem, currentUser);
            } else {
                const { language, code, compileAndRunOptions } = body;
                if (!code) throw new EmptyCodeException();
                if (
                    !language ||
                    !compileAndRunOptions ||
                    this.codeLanguageService.validateCompileAndRunOptions(language, compileAndRunOptions).length > 0
                ) {
                    throw new InvalidLanguageOrCompileOptionsException();
                }
                submission = await this.submissionService.addCodeSubmissionAsync(
                    code,
                    language,
                    compileAndRunOptions,
                    problem,
                    currentUser,
                );
            }

            return {
                url: `/submission/${submission.id}`,
            };
        });
    }

    @Post(":id/delete")
    @Redirect("/problem")
    public async deleteProblemAsync(
        @Param() param: ProblemBasicRequestParamDto,
        @Res() res: IResponse,
        @CurrentUser() currentUser: UserEntity | null,
    ) {
        if (!currentUser || !this.problemService.checkIsAllowedEdit(currentUser)) {
            throw new PermissionDeniedException();
        }

        const problem = await this.problemService.findProblemByIdAsync(param.id);
        if (!problem) {
            throw new NoSuchProblemException();
        }

        await this.problemService.deleteProblemAsync(problem);
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
            const error = await this.problemService.addProblemFileAsync(problem, body.type, body.filename, body.token);

            if (error) {
                return { error };
            }

            return { done: true };
        });
    }

    @Post(":id/signSubmitAnswerFileUploadRequest")
    public async postSignSubmitAnswerFileUploadRequestAsync(
        @Param() param: ProblemBasicRequestParamDto,
        @Body() body: ProblemSignFileUploadRequestPostRequestBodyDto,
        @CurrentUser() currentUser: UserEntity | null,
    ): Promise<ProblemSignFileUploadRequestResponseDto> {
        if (!currentUser) {
            return { error: CE_ProblemFileUploadError.PermissionDenied };
        }
        const problem = await this.problemService.findProblemByIdAsync(param.id);
        if (!problem) {
            return { error: CE_ProblemFileUploadError.NoSuchProblem };
        }
        if (!(await this.problemService.checkIsAllowedSubmitAsync(problem, currentUser))) {
            return { error: CE_ProblemFileUploadError.PermissionDenied };
        }
        const judgeInfo = await problem.judgeInfoPromise;
        if (!judgeInfo || !this.problemTypeService.get(judgeInfo.type).shouldUploadAnswerFile) {
            return { error: CE_ProblemFileUploadError.NotAllowedToSubmitFile };
        }

        try {
            const uploadRequest = await this.fileService.signUploadRequestAsync(body.size);
            return { uploadRequest };
        } catch (e) {
            Logger.error(`Failed to sign upload request for problem "${problem.id}": ${e}`);
            return { error: CE_ProblemFileUploadError.MinIOError };
        }
    }
}
