import { Controller, Get } from "@nestjs/common";

import { AppDevelopingException } from "@/common/exceptions/app-developing.exception";
import { CE_Page } from "@/common/types/page";

@Controller(CE_Page.Submission)
export class SubmissionController {
    @Get()
    public getSubmissionList() {
        throw new AppDevelopingException();
    }
}
