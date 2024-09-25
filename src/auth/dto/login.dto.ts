import { IsNotEmpty, IsString } from "class-validator";

export class LoginPostRequestBodyDto {
    @IsString()
    public username: string;

    @IsString()
    @IsNotEmpty()
    public password: string;
}

export class LoginPostResponseDto {
    public status: number;
}

export const enum CE_LoginPostResponseStatus {
    Success = 0,
    NoSuchUser = 1,
    WrongPassword = 2,
}
