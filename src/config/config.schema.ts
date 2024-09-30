import { Type } from "class-transformer";
import {
    IsIn,
    IsInt,
    IsIP,
    IsNotEmpty,
    IsNotEmptyObject,
    IsOptional,
    IsString,
    IsUrl,
    ValidateNested,
} from "class-validator";

import { IsHostname, IsPortNumber } from "@/common/validators";

import { IAppConfig, IDatabaseConfig, IPaginationConfig, ISecurityConfig, IServerConfig } from "./config.type";

class ServerConfig implements IServerConfig {
    @IsIP()
    public readonly hostname: string;

    @IsPortNumber()
    public readonly port: number;
}

class DatabaseConfig implements IDatabaseConfig {
    @IsHostname({
        require_tld: false,
    })
    public readonly hostname: string;

    @IsPortNumber()
    public readonly port: number;

    @IsString()
    @IsNotEmpty()
    public readonly username: string;

    @IsString()
    @IsNotEmpty()
    public readonly password: string;

    @IsString()
    @IsNotEmpty()
    public readonly database: string;

    @IsIn(["mysql", "mariadb"])
    public readonly type: "mysql" | "mariadb";
}

class SecurityConfig implements ISecurityConfig {
    @IsString()
    @IsNotEmpty()
    public readonly sessionSecret: string;
}

class PaginationConfig implements IPaginationConfig {
    @IsInt()
    public readonly homePageRanklist: number;

    @IsInt()
    public readonly homePageArticle: number;

    @IsInt()
    public readonly problem: number;

    @IsInt()
    public readonly contest: number;

    @IsInt()
    public readonly homework: number;

    @IsInt()
    public readonly submission: number;

    @IsInt()
    public readonly ranklist: number;

    @IsInt()
    public readonly article: number;
}

export class AppConfig implements IAppConfig {
    @IsString()
    @IsNotEmpty()
    public readonly appName: string;

    @Type(() => ServerConfig)
    @ValidateNested()
    @IsNotEmptyObject()
    public readonly server: IServerConfig;

    @Type(() => DatabaseConfig)
    @ValidateNested()
    @IsNotEmptyObject()
    public readonly database: IDatabaseConfig;

    @IsUrl({
        protocols: ["redis", "rediss", "redis-socket", "redis-sentinel"],
        require_protocol: true,
        require_host: true,
        require_tld: false,
    })
    public readonly redis: string;

    @Type(() => SecurityConfig)
    @ValidateNested()
    @IsNotEmptyObject()
    public readonly security: ISecurityConfig;

    @IsUrl({
        protocols: ["http", "https"],
        require_protocol: true,
        require_host: true,
        require_tld: false,
    })
    @IsOptional()
    public readonly cdnUrl?: string;

    @Type(() => PaginationConfig)
    @ValidateNested()
    @IsNotEmptyObject()
    public readonly pagination: IPaginationConfig;
}
