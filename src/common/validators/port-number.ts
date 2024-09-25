import type { ValidationOptions } from "class-validator";
import { isInt, max, min } from "class-validator";

import { If } from "./if";

export function isPortNumber(value: unknown): value is number {
    return isInt(value) && min(value, 1) && max(value, 65535);
}

export function IsPortNumber(validationOptions?: ValidationOptions) {
    return If(isPortNumber, {
        message: ({ property }) => `${property} must be a port number`,
        ...validationOptions,
    });
}
