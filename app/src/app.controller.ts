import { Controller, Get, Render } from "@nestjs/common";

import { AppService } from "./app.service";
import { CE_Page } from "./common/types/page";
@Controller()
export class AppController {
    constructor(private readonly appService: AppService) {}

    @Get()
    @Render("home")
    public home() {}

    @Get(CE_Page.Help)
    @Render("help")
    public help(): void {}
}
