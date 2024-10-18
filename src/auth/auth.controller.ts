import { Body, Controller, Get, Post, Query, Redirect, Render, Req, Res } from "@nestjs/common";
import { Response } from "express";

import { AppDevelopingException } from "@/common/exceptions/common";
import { CE_Page } from "@/common/types/page";
import { IRequest } from "@/common/types/request";
import { IResponse } from "@/common/types/response";
import { CE_CommonPermission } from "@/permission/permission.enum";
import { PermissionService } from "@/permission/permission.service";
import { UserService } from "@/user/user.service";

import { AuthService } from "./auth.service";
import { AuthSessionService } from "./auth-session.service";
import {
    CE_LoginPostResponseError,
    LoginRequestBodyDto,
    LoginRequestQueryDto,
    LoginResponseDto,
} from "./dto/login.dto";

@Controller(CE_Page.Auth)
export class AuthController {
    constructor(
        private readonly authService: AuthService,
        private readonly authSessionService: AuthSessionService,
        private readonly userService: UserService,
        private readonly permissionService: PermissionService,
    ) {}

    @Get("login")
    @Render("auth-login")
    public async getLoginAsync(): Promise<LoginResponseDto> {
        return {
            username: "",
        };
    }

    @Post("login")
    @Render("auth-login")
    public async postLoginAsync(
        @Req() req: IRequest,
        @Res() res: IResponse,
        @Query() query: LoginRequestQueryDto,
        @Body() body: LoginRequestBodyDto,
    ): Promise<void> {
        const render = (options: LoginResponseDto) => res.render("auth-login", options);
        const redirect = () => res.redirect(query.redirect || "/");
        const { username, password } = body;

        const user = await this.userService.findUserByUsernameAsync(username);

        if (!user) {
            return render({
                error: CE_LoginPostResponseError.NoSuchUser,
                username,
            });
        }

        const auth = await user.authPromise;

        if (auth.legacyPassword) {
            if (!(await this.authService.migratePasswordAsync(auth, password))) {
                return render({
                    error: CE_LoginPostResponseError.WrongPassword,
                    username,
                });
            }
        } else {
            if (!(await this.authService.checkPasswordAsync(auth, password))) {
                return render({
                    error: CE_LoginPostResponseError.WrongPassword,
                    username,
                });
            }
        }

        if (
            !this.permissionService.isSpecificUser(user.level) &&
            !this.permissionService.checkCommonPermission(CE_CommonPermission.AccessSite, user.level)
        ) {
            return render({
                error: CE_LoginPostResponseError.PermissionDenied,
                username,
            });
        }

        this.authSessionService.setCookieSessionKey(
            res,
            await this.authSessionService.newSessionAsync(user, req.ip!, req.headers["user-agent"]!),
        );

        return redirect();
    }

    @Get("register")
    public async getRegisterAsync(): Promise<void> {
        throw new AppDevelopingException();
    }

    @Get("forgot")
    public async getForgotAsync(): Promise<void> {
        throw new AppDevelopingException();
    }

    @Post("logout")
    @Redirect("/")
    public async postLogoutAsync(@Req() req: IRequest, @Res() res: Response): Promise<void> {
        if (req.session?.sessionKey) {
            await this.authSessionService.endSessionAsync(req.session.sessionKey);
        }
        this.authSessionService.clearCookieSessionKey(res);
    }
}
