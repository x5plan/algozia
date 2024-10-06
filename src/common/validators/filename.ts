import { isString, type ValidationOptions } from "class-validator";

import { If } from "./if";

const forbiddenCharacters = ["/", "\x00"];
const reservedFilenames = [".", ".."];

export function isValidFilename(filename: unknown): filename is string {
    return (
        isString(filename) &&
        forbiddenCharacters.every((ch) => filename.indexOf(ch) === -1) &&
        !reservedFilenames.includes(filename)
    );
}

export function IsValidFilename(validationOptions?: ValidationOptions) {
    return If((value) => isValidFilename(value), {
        message: ({ property }) => `${property} must be a valid filename.`,
        ...validationOptions,
    });
}
