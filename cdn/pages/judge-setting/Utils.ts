import type { IPageSharedObject } from "./Types";

export function getSharedObject(): IPageSharedObject {
    return window.PageSharedObject;
}
