import { Type } from "class-transformer";
import {
    IsArray,
    IsBoolean,
    IsIn,
    IsInt,
    IsIP,
    IsNotEmpty,
    IsNotEmptyObject,
    IsOptional,
    IsString,
    IsUrl,
    Min,
    ValidateNested,
} from "class-validator";

import { IsHostname, IsPortNumber } from "@/common/validators";

import {
    IAppConfig,
    IDatabaseConfig,
    IJudgeConfig,
    IJudgeLimitConfig,
    IMinIOBucketConfig,
    IMinIOConfig,
    IPaginationConfig,
    ISecurityConfig,
    IServerConfig,
} from "./config.type";

class ServerConfig implements IServerConfig {
    @IsIP()
    public readonly hostname: string;

    @IsPortNumber()
    public readonly port: number;

    @IsArray()
    @IsString({ each: true })
    public readonly trustProxy: string[];
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

class MinIOBucketConfig implements IMinIOBucketConfig {
    @IsString()
    @IsNotEmpty()
    public readonly name: string;

    @IsUrl({
        protocols: ["http", "https"],
        require_protocol: true,
        require_host: true,
        require_tld: false,
    })
    @IsOptional()
    public readonly publicUrl?: string | null;
}

class MinIOConfig implements IMinIOConfig {
    @IsHostname({
        require_tld: false,
    })
    public readonly endPoint: string;

    @IsPortNumber()
    public readonly port: number;

    @IsBoolean()
    public readonly useSSL: boolean;

    @IsString()
    @IsNotEmpty()
    public readonly accessKey: string;

    @IsString()
    @IsNotEmpty()
    public readonly secretKey: string;

    @IsBoolean()
    public readonly pathStyle: boolean;

    @IsString()
    @IsOptional()
    public readonly region?: string | null;

    @Type(() => MinIOBucketConfig)
    @ValidateNested()
    @IsNotEmptyObject()
    public readonly bucket: IMinIOBucketConfig;

    @Type(() => MinIOBucketConfig)
    @ValidateNested()
    @IsOptional()
    public readonly tempBucket?: IMinIOBucketConfig | null;
}

class SecurityConfig implements ISecurityConfig {
    @IsString()
    @IsNotEmpty()
    public readonly sessionSecret: string;

    @IsString()
    @IsNotEmpty()
    public readonly fileUploadSecret: string;
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

class JudgeLimitConfig implements IJudgeLimitConfig {
    @IsInt()
    @Min(1)
    public readonly compilerMessage: number;

    @IsInt()
    @Min(1)
    public readonly outputSize: number;

    @IsInt()
    @Min(1)
    public readonly dataDisplay: number;

    @IsInt()
    @Min(1)
    public readonly dataDisplayForSubmitAnswer: number;

    @IsInt()
    @Min(1)
    public readonly stderrDisplay: number;
}

class JudgeConfig implements IJudgeConfig {
    @IsBoolean()
    public readonly dynamicTaskPriority: boolean;

    @ValidateNested()
    @Type(() => JudgeLimitConfig)
    @IsNotEmptyObject()
    public readonly limit: IJudgeLimitConfig;
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

    @Type(() => MinIOConfig)
    @ValidateNested()
    @IsNotEmptyObject()
    public readonly minio: IMinIOConfig;

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
    public readonly cdnUrl?: string | null;

    @Type(() => PaginationConfig)
    @ValidateNested()
    @IsNotEmptyObject()
    public readonly pagination: IPaginationConfig;

    @ValidateNested()
    @Type(() => JudgeConfig)
    @IsNotEmptyObject()
    public readonly judge: IJudgeConfig;
}
