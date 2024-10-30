export interface IServerConfig {
    readonly hostname: string;
    readonly port: number;
    readonly trustProxy: string[];
}

export interface IDatabaseConfig {
    readonly hostname: string;
    readonly port: number;
    readonly username: string;
    readonly password: string;
    readonly database: string;
    readonly type: "mysql" | "mariadb";
}

export interface IMinIOConfig {
    readonly endPoint: string;
    readonly port: number;
    readonly useSSL: boolean;
    readonly publicUrlEndPoint?: string;
    readonly accessKey: string;
    readonly secretKey: string;
    readonly bucket: string;
}

export interface ISecurityConfig {
    readonly sessionSecret: string;
}

export interface IPaginationConfig {
    readonly homePageRanklist: number;
    readonly homePageArticle: number;
    readonly problem: number;
    readonly contest: number;
    readonly homework: number;
    readonly submission: number;
    readonly ranklist: number;
    readonly article: number;
}

export interface IJudgeLimitConfig {
    readonly compilerMessage: number;
    readonly outputSize: number;
    readonly dataDisplay: number;
    readonly dataDisplayForSubmitAnswer: number;
    readonly stderrDisplay: number;
}

export interface IJudgeConfig {
    readonly dynamicTaskPriority: boolean;
    readonly limit: IJudgeLimitConfig;
}

export interface IAppConfig {
    readonly appName: string;
    readonly server: IServerConfig;
    readonly database: IDatabaseConfig;
    readonly minio: IMinIOConfig;
    readonly redis: string;
    readonly security: ISecurityConfig;
    readonly cdnUrl?: string;
    readonly pagination: IPaginationConfig;
    readonly judge: IJudgeConfig;
}
