import { Controller, Get, Param, Req } from "@nestjs/common";

import { CurrentUser } from "@/common/decorators/user.decorator";
import { LoginRequiredException } from "@/common/exceptions/auth";
import { AppDevelopingException } from "@/common/exceptions/common";
import { CE_Page } from "@/common/types/page";
import { IRequest } from "@/common/types/request";
import { UserEntity } from "@/user/user.entity";

import { SubmissionDetailResponseDto } from "./dto/submission-detail.dto";
import { SubmissionBasicRequestParamDto } from "./dto/submission-shared.dto";
import { NoSuchSubmissionException } from "./submission.exception";
import { SubmissionService } from "./submission.service";

@Controller(CE_Page.Submission)
export class SubmissionController {
    constructor(private readonly submissionService: SubmissionService) {}

    @Get()
    public getSubmissionList() {
        throw new AppDevelopingException();
    }

    @Get(":id")
    public async getSubmissionDetailAsync(
        @Req() req: IRequest,
        @Param() params: SubmissionBasicRequestParamDto,
        @CurrentUser() currentUser: UserEntity | null,
    ): Promise<SubmissionDetailResponseDto> {
        if (!currentUser) {
            throw new LoginRequiredException(req.url);
        }

        const submission = await this.submissionService.findSubmissionByIdAsync(params.id);
        if (!submission) throw new NoSuchSubmissionException();

        const submissionDetail = await submission.detailPromise;
        if (!submissionDetail) throw new NoSuchSubmissionException();

        const problem = await submission.problemPromise;
        const judgeInfo = await problem.judgeInfoPromise;

        return {
            submission,
            detail: submissionDetail,
            problem,
            judgeInfo,
        };
    }
}
