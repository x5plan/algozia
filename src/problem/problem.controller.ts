import { Controller, Get } from "@nestjs/common";

import { AppDevelopingException } from "@/common/exceptions/app-developing.exception";
import { CE_Page } from "@/common/types/page";

@Controller(CE_Page.Problem)
export class ProblemController {
    @Get("/")
    public getProblemList() {
        throw new AppDevelopingException();
    }
}
