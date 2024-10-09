import type { PartialDeep } from "type-fest";

import type { E_CodeLanguage } from "@/code-language/code-language.type";
import { CE_JudgeInfoValidationMessage } from "@/common/strings/judge-info-validation-message";
import { format } from "@/common/utils/format";
import { isSafeInt } from "@/common/validators";
import type { ProblemFileEntity } from "@/problem/problem-file.entity";

import { restrictProperties } from "../../common/utils/restrict-properties";
import type { IProblemJudgeInfo, IProblemJudgeInfoChecker } from "../problem-type.type";
import type { IProblemJudgeInfoValidationResult } from "./type";
import { isValidCheckerInterface, isValidCodeLanguage } from "./utils";

export interface IProblemJudgeInfoForValidation extends PartialDeep<IProblemJudgeInfo, { recurseIntoArrays: true }> {
    timeLimit?: number;
    memoryLimit?: number;

    checker?: PartialDeep<IProblemJudgeInfoChecker>;
}

export interface IValidateCheckerOptions {
    validateCompileAndRunOptions: (codeLanguage: E_CodeLanguage, languageOptions: unknown) => boolean;
}

export function validateChecker(
    judgeInfo: IProblemJudgeInfoForValidation,
    testData: ProblemFileEntity[],
    options: IValidateCheckerOptions,
): IProblemJudgeInfoValidationResult {
    if (!judgeInfo.checker) {
        return {
            success: false,
            message: CE_JudgeInfoValidationMessage.InvalidCheckerType,
        };
    }

    switch (judgeInfo.checker.type) {
        case "integers":
            restrictProperties(judgeInfo.checker, ["type"]);
            break;

        case "floats":
            if (!(isSafeInt(judgeInfo.checker.precision) && judgeInfo.checker.precision > 0)) {
                return {
                    success: false,
                    message: CE_JudgeInfoValidationMessage.InvalidCheckerOptions,
                };
            }

            restrictProperties(judgeInfo.checker, ["type", "precision"]);
            break;

        case "lines":
            if (typeof judgeInfo.checker.caseSensitive !== "boolean") {
                return {
                    success: false,
                    message: CE_JudgeInfoValidationMessage.InvalidCheckerOptions,
                };
            }

            restrictProperties(judgeInfo.checker, ["type", "caseSensitive"]);
            break;

        case "binary":
            restrictProperties(judgeInfo.checker, ["type"]);
            break;

        case "custom": {
            const { checker } = judgeInfo;
            if (!isValidCheckerInterface(checker.interface)) {
                return {
                    success: false,
                    message: CE_JudgeInfoValidationMessage.InvalidCheckerInterface,
                };
            }
            if (!isValidCodeLanguage(checker.language)) {
                return {
                    success: false,
                    message: CE_JudgeInfoValidationMessage.InvalidCheckerLanguage,
                };
            }
            if (!testData.some((file) => file.filename === checker.filename)) {
                return {
                    success: false,
                    message: format(CE_JudgeInfoValidationMessage.NoSuchCheckerFile, checker.filename || "null"),
                };
            }
            if (!options.validateCompileAndRunOptions(checker.language, checker.compileAndRunOptions)) {
                return {
                    success: false,
                    message: CE_JudgeInfoValidationMessage.InvalidCheckerCompileAndRunOptions,
                };
            }

            const timeLimit = checker.timeLimit;
            if (timeLimit != null && (!isSafeInt(timeLimit) || timeLimit <= 0)) {
                return {
                    success: false,
                    message: CE_JudgeInfoValidationMessage.InvalidCheckerTimeLimit,
                };
            }

            const memoryLimit = checker.memoryLimit;
            if (memoryLimit != null && (!isSafeInt(memoryLimit) || memoryLimit <= 0)) {
                return {
                    success: false,
                    message: CE_JudgeInfoValidationMessage.InvalidCheckerMemoryLimit,
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
                message: CE_JudgeInfoValidationMessage.InvalidCheckerType,
            };
    }

    return { success: true };
}
