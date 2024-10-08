import { E_CodeLanguage } from "@/code-language/code-language.type";
import { CE_JudgeInfoValidationMessage } from "@/common/strings/judge-info-validation-message";
import { format } from "@/common/utils/format";
import { isSafeInt } from "@/common/validators";
import type { ProblemFileEntity } from "@/problem/problem-file.entity";

import { restrictProperties } from "./restrict-properties";

interface ICheckerTypeIntegers {
    type: "integers";
}

interface ICheckerTypeFloats {
    type: "floats";
    precision: number;
}

interface ICheckerTypeLines {
    type: "lines";
    caseSensitive: boolean;
}

interface ICheckerTypeBinary {
    type: "binary";
}

interface ICheckerTypeCustom {
    type: "custom";
    interface: string;
    language: E_CodeLanguage;
    compileAndRunOptions: unknown;
    filename: string;
    timeLimit?: number;
    memoryLimit?: number;
}

// integers: check the equivalent of each integer in user's output and answer
// floats:   check each float in user's output and answer
//           allow output with relative or absolute error not exceeding [floats.precision].
// lines:    check the equivalent of text in each line (separated by "\n"), maybe case-insensitive
//           any space characters (space, \t, \r) in the end of a line will be ignored
//           any empty lines in the end of file will be ignored
// binary:   check if the user's output and answer files are equal in binary
// custom:   use a custom program to check the user's output
export type IChecker =
    | ICheckerTypeIntegers
    | ICheckerTypeFloats
    | ICheckerTypeLines
    | ICheckerTypeBinary
    | ICheckerTypeCustom;

export interface IJudgeInfoWithChecker {
    timeLimit?: number;
    memoryLimit?: number;

    checker: IChecker;
}

export interface IValidateCheckerOptions {
    validateCompileAndRunOptions: (codeLanguage: E_CodeLanguage, languageOptions: unknown) => boolean;
    hardTimeLimit?: number;
    hardMemoryLimit?: number;
}

export type IValidateCheckerResult = { success: true } | { success: false; error: string };

export function validateChecker(
    judgeInfo: IJudgeInfoWithChecker,
    testData: ProblemFileEntity[],
    options: IValidateCheckerOptions,
): IValidateCheckerResult {
    if (!judgeInfo.checker) {
        return {
            success: false,
            error: CE_JudgeInfoValidationMessage.InvalidCheckerType,
        };
    }

    switch (judgeInfo.checker.type) {
        case "integers":
            restrictProperties(judgeInfo.checker, ["type"]);
            break;

        case "floats":
            if (!(Number.isSafeInteger(judgeInfo.checker.precision) && judgeInfo.checker.precision > 0)) {
                return {
                    success: false,
                    error: CE_JudgeInfoValidationMessage.InvalidCheckerOptions,
                };
            }

            restrictProperties(judgeInfo.checker, ["type", "precision"]);
            break;

        case "lines":
            if (typeof judgeInfo.checker.caseSensitive !== "boolean") {
                return {
                    success: false,
                    error: CE_JudgeInfoValidationMessage.InvalidCheckerOptions,
                };
            }

            restrictProperties(judgeInfo.checker, ["type", "caseSensitive"]);
            break;

        case "binary":
            restrictProperties(judgeInfo.checker, ["type"]);
            break;

        case "custom": {
            const { checker } = judgeInfo;
            if (!["testlib", "legacy", "lemon", "hustoj", "qduoj", "domjudge"].includes(checker.interface)) {
                return {
                    success: false,
                    error: CE_JudgeInfoValidationMessage.InvalidCheckerInterface,
                };
            }
            if (!Object.values(E_CodeLanguage).includes(checker.language)) {
                return {
                    success: false,
                    error: CE_JudgeInfoValidationMessage.InvalidCheckerLanguage,
                };
            }
            if (!testData.some((file) => file.filename === checker.filename)) {
                return {
                    success: false,
                    error: format(CE_JudgeInfoValidationMessage.NoSuchCheckerFile, checker.filename),
                };
            }
            if (!options.validateCompileAndRunOptions(checker.language, checker.compileAndRunOptions)) {
                return {
                    success: false,
                    error: CE_JudgeInfoValidationMessage.InvalidCheckerCompileAndRunOptions,
                };
            }

            const timeLimit = judgeInfo.checker.timeLimit ?? judgeInfo.timeLimit;
            if (!isSafeInt(timeLimit) || timeLimit <= 0) {
                return {
                    success: false,
                    error: CE_JudgeInfoValidationMessage.InvalidCheckerTimeLimit,
                };
            }
            if (options.hardTimeLimit != null && timeLimit > options.hardTimeLimit) {
                return {
                    success: false,
                    error: format(CE_JudgeInfoValidationMessage.CheckerTimeLimitTooLarge, timeLimit),
                };
            }

            const memoryLimit = judgeInfo.checker.memoryLimit ?? judgeInfo.memoryLimit;
            if (!isSafeInt(memoryLimit) || memoryLimit <= 0) {
                return {
                    success: false,
                    error: CE_JudgeInfoValidationMessage.InvalidCheckerMemoryLimit,
                };
            }
            if (options.hardMemoryLimit != null && memoryLimit > options.hardMemoryLimit) {
                return {
                    success: false,
                    error: format(CE_JudgeInfoValidationMessage.CheckerMemoryLimitTooLarge, memoryLimit),
                };
            }

            restrictProperties(judgeInfo.checker, [
                "type",
                "interface",
                "language",
                "compileAndRunOptions",
                "filename",
                "timeLimit",
                "memoryLimit",
            ]);
            break;
        }

        default:
            return {
                success: false,
                error: CE_JudgeInfoValidationMessage.InvalidCheckerType,
            };
    }

    return { success: true };
}
