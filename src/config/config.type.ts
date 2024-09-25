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

export interface IAppConfig {
    readonly appName: string;
    readonly server: IServerConfig;
    readonly database: IDatabaseConfig;
    readonly redis: string;
    readonly cdnUrl?: string;
}
