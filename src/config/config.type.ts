export interface IServerConfig {
    readonly hostname: string;
    readonly port: number;
}

export interface IDatabaseConfig {
    readonly hostname: string;
    readonly port: number;
    readonly username: string;
    readonly password: string;
    readonly database: string;
    readonly type: "mysql" | "mariadb";
}

export interface ISecurityConfig {
    readonly sessionSecret: string;
}

export interface IAppConfig {
    readonly appName: string;
    readonly server: IServerConfig;
    readonly database: IDatabaseConfig;
    readonly redis: string;
    readonly security: ISecurityConfig;
    readonly cdnUrl?: string;
}
