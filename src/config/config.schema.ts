import { Type } from "class-transformer";
import { IsIn, IsIP, IsNotEmpty, IsNotEmptyObject, IsOptional, IsString, IsUrl, ValidateNested } from "class-validator";

import { IsHostname, IsPortNumber } from "@/common/validators";

import { IAppConfig, IDatabaseConfig, ISecurityConfig, IServerConfig } from "./config.type";

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
}
