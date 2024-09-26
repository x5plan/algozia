export interface IErrorOptions {
    description?: string;
    urls?: IErrorUrl[];
    showBack?: boolean;
}

export interface IErrorUrl {
    text: string;
    href: string;
}
