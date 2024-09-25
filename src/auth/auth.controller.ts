import { Body, Controller, Get, Post, Redirect, Req, Res } from "@nestjs/common";
import { Response } from "express";

import { ConfigService } from "@/config/config.service";
import { UserService } from "@/user/user.service";

import { clearSessionCookie, IRequestWithSession, setSessionCookie } from "./auth.middleware";
import { AuthService } from "./auth.service";
import { AuthSessionService } from "./auth-session.service";
import { CE_LoginPostResponseStatus, LoginPostRequestBodyDto, LoginPostResponseDto } from "./dto/login.dto";

@Controller("auth")
export class AuthController {
    constructor(
        private readonly authService: AuthService,
        private readonly authSessionService: AuthSessionService,
        private readonly userService: UserService,
        private readonly configService: ConfigService,
    ) {}

    @Get("login")
    public async getLoginAsync() {
        // TODO: Render login page
    }

    @Post("login")
    public async postLoginAsync(
        @Req() req: IRequestWithSession,
        @Res() res: Response,
        @Body() body: LoginPostRequestBodyDto,
    ): Promise<LoginPostResponseDto> {
        const { username, password } = body;

        const user = await this.userService.findUserByUsernameAsync(username);

        if (!user) {
            return {
                status: CE_LoginPostResponseStatus.NoSuchUser,
            };
        }

        const auth = await user.authPromise;

        if (auth.legacyPassword) {
            if (!(await this.authService.migratePasswordAsync(auth, password))) {
                return {
                    status: CE_LoginPostResponseStatus.WrongPassword,
                };
            }
        } else {
            if (!(await this.authService.checkPasswordAsync(auth, password))) {
                return {
                    status: CE_LoginPostResponseStatus.WrongPassword,
                };
            }
        }

        setSessionCookie(res, await this.authSessionService.newSessionAsync(user, req.ip!, req.headers["user-agent"]!));

        return {
            status: CE_LoginPostResponseStatus.Success,
        };
    }

    @Post("logout")
    @Redirect("/")
    public async postLogoutAsync(@Req() req: IRequestWithSession, @Res() res: Response): Promise<void> {
        if (req.session?.sessionKey) {
            await this.authSessionService.endSessionAsync(req.session.sessionKey);
        }
        clearSessionCookie(res);
    }
}
