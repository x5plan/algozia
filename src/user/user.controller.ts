import { Controller, Get } from "@nestjs/common";

import { AppDevelopingException } from "@/common/exceptions/common";

@Controller("user")
export class UserController {
    @Get()
    public getUserList() {
        throw new AppDevelopingException();
    }

    @Get(":id")
    public getUser() {
        throw new AppDevelopingException();
    }

    @Get(":id/edit")
    public getUserEdit() {
        throw new AppDevelopingException();
    }
}
