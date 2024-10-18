import serialize from "serialize-javascript";

import { defaultIcon, suffixIconMap } from "../const/file-icon";
import type { IRequest } from "../types/request";
import type { IResponse } from "../types/response";

export class ViewUtils {
    constructor(
        private readonly req: IRequest,
        private readonly res: IResponse,
    ) {}

    public readonly serialize = serialize;

    public makeUrl({
        path,
        query = {},
        serialize = false,
    }: {
        path?: string;
        query?: Record<string, string>;
        serialize?: boolean;
    }): string {
        const searchParams = new URLSearchParams();
        path = path || this.req.path;

        for (const [key, value] of Object.entries(this.req.query)) {
            if (key && typeof value === "string") {
                searchParams.set(key, value);
            }
        }

        for (const [key, value] of Object.entries(query)) {
            searchParams.set(key, value);
        }

        const qs = searchParams.toString();
        const url = path + (qs ? `?${qs}` : "");

        return serialize ? this.serialize(url) : url;
    }

    public formatFileSize(size: number, precision = 2): string {
        const units = ["KiB", "MiB", "GiB", "TiB"];

        let unit = "B";
        for (const currUnit of units) {
            if (size > 1024) {
                size /= 1024;
                unit = currUnit;
            } else {
                break;
            }
        }

        const fixed = size === Math.round(size) ? size.toString() : size.toFixed(precision);
        return fixed + " " + unit;
    }

    public getFileIcon(filename: string) {
        const ext = filename.split(".").pop();
        return suffixIconMap[`.${ext}`] || defaultIcon;
    }
}
