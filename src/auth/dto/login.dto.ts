import { IsNotEmpty, IsString } from "class-validator";

import { CE_ExceptionString } from "@/common/strings/exception";

export class LoginRequestBodyDto {
    @IsString()
    @IsNotEmpty()
    public username: string;

    @IsString()
    @IsNotEmpty()
    public password: string;
}

export class LoginResponseDto {
    public error?: CE_LoginPostResponseError;
    public username: string;
}

export const enum CE_LoginPostResponseError {
    NoSuchUser = CE_ExceptionString.NoSuchUser,
    WrongPassword = CE_ExceptionString.Auth_WrongPassword,
    PermissionDenied = CE_ExceptionString.PermissionDenied,
}
