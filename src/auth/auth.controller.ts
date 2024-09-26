import { Body, Controller, Get, Post, Redirect, Render, Req, Res } from "@nestjs/common";
import { Response } from "express";

import { ConfigService } from "@/config/config.service";
import { UserService } from "@/user/user.service";

import { IRequestWithSession } from "./auth.middleware";
import { AuthService } from "./auth.service";
import { AuthSessionService } from "./auth-session.service";
import { CE_LoginPostResponseError, LoginRequestBodyDto, LoginResponseDto } from "./dto/login.dto";

@Controller("auth")
export class AuthController {
    constructor(
        private readonly authService: AuthService,
        private readonly authSessionService: AuthSessionService,
        private readonly userService: UserService,
        private readonly configService: ConfigService,
    ) {}

    @Get("login")
    @Render("auth-login")
    public async getLoginAsync(): Promise<LoginResponseDto> {
        return {
            error: null,
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

        this.authSessionService.setCookieSessionKey(
            res,
            await this.authSessionService.newSessionAsync(user, req.ip!, req.headers["user-agent"]!),
        );

        res.redirect("/");
        return {
            error: null,
            username,
        };
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
