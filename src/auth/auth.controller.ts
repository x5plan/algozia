import { Body, Controller, Get, Post, Redirect, Render, Req, Res } from "@nestjs/common";
import { Response } from "express";

import { AppDevelopingException } from "@/common/exceptions/common.exception";
import { CE_Permission } from "@/common/permission/permissions";
import { CE_Page } from "@/common/types/page";
import { PermissionService } from "@/permission/permission.service";
import { UserService } from "@/user/user.service";

import { IRequestWithSession } from "./auth.middleware";
import { AuthService } from "./auth.service";
import { AuthSessionService } from "./auth-session.service";
import { CE_LoginPostResponseError, LoginRequestBodyDto, LoginResponseDto } from "./dto/login.dto";

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
        @Req() req: IRequestWithSession,
        @Res() res: Response,
        @Body() body: LoginRequestBodyDto,
    ): Promise<LoginResponseDto> {
        const { username, password } = body;

        const user = await this.userService.findUserByUsernameAsync(username);

        if (!user) {
            return {
                error: CE_LoginPostResponseError.NoSuchUser,
                username,
            };
        }

        const auth = await user.authPromise;

        if (auth.legacyPassword) {
            if (!(await this.authService.migratePasswordAsync(auth, password))) {
                return {
                    error: CE_LoginPostResponseError.WrongPassword,
                    username,
                };
            }
        } else {
            if (!(await this.authService.checkPasswordAsync(auth, password))) {
                return {
                    error: CE_LoginPostResponseError.WrongPassword,
                    username,
                };
            }
        }

        if (!this.permissionService.checkCommonPermission(CE_Permission.AccessSite, user, true /* specificAllowed */)) {
            return {
                error: CE_LoginPostResponseError.PermissionDenied,
                username,
            };
        }

        this.authSessionService.setCookieSessionKey(
            res,
            await this.authSessionService.newSessionAsync(user, req.ip!, req.headers["user-agent"]!),
        );

        res.redirect("/");
        return {
            username,
        };
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
    public async postLogoutAsync(@Req() req: IRequestWithSession, @Res() res: Response): Promise<void> {
        if (req.session?.sessionKey) {
            await this.authSessionService.endSessionAsync(req.session.sessionKey);
        }
        this.authSessionService.clearCookieSessionKey(res);
    }
}
