import type { ValidationOptions } from "class-validator";

import { If } from "./if";

export function isSafeInt(value: unknown): value is number {
    return typeof value === "number" && Number.isSafeInteger(value);
}

export function IsSafeInt(validationOptions?: ValidationOptions) {
    return If(isSafeInt, {
        message: ({ property }) => `${property} must be a safe integer`,
        ...validationOptions,
    });
}
