import { isString } from "class-validator";
import type { PartialDeep } from "type-fest";

import { E_CodeLanguage } from "@/code-language/code-language.type";
import { CE_JudgeInfoValidationMessage } from "@/common/strings/exception";
import { format } from "@/common/utils/format";
import { isValidFilename } from "@/common/validators";
import type { ProblemFileEntity } from "@/problem/problem-file.entity";

import type { IProblemJudgeInfo } from "../problem-type.type";
import type { IProblemJudgeInfoValidationResult } from "./type";

interface IProblemJudgeInfoForValidation extends PartialDeep<IProblemJudgeInfo, { recurseIntoArrays: true }> {
    extraSourceFiles?: Partial<Record<E_CodeLanguage, Record<string, string>>>;
}

export function validateExtraSourceFiles(
    judgeInfo: IProblemJudgeInfoForValidation,
    testData: ProblemFileEntity[],
): IProblemJudgeInfoValidationResult {
    if (judgeInfo.extraSourceFiles) {
        if (typeof judgeInfo.extraSourceFiles !== "object") {
            return {
                success: false,
                message: CE_JudgeInfoValidationMessage.InvalidExtraSourceFiles,
            };
        }

        const fileEntries = Object.entries(judgeInfo.extraSourceFiles);

        for (const [codeLanguage, files] of fileEntries) {
            if (!Object.values(E_CodeLanguage).includes(codeLanguage as E_CodeLanguage)) {
                return {
                    success: false,
                    message: CE_JudgeInfoValidationMessage.InvalidExtraSourceFilesLanguage,
                };
            }
            if (typeof files !== "object") {
                return {
                    success: false,
                    message: CE_JudgeInfoValidationMessage.InvalidExtraSourceFiles,
                };
            }

            const subFileEntries = Object.entries(files);
            for (const [dst, src] of subFileEntries) {
                if (!isString(dst) || !isValidFilename(dst)) {
                    return {
                        success: false,
                        message: format(CE_JudgeInfoValidationMessage.InvalidExtraSourceFilesDst, dst, codeLanguage),
                    };
                }
                if (!testData.some((file) => file.filename === src)) {
                    return {
                        success: false,
                        message: format(CE_JudgeInfoValidationMessage.NoSuchExtraSourceFilesSrc, src, codeLanguage),
                    };
                }
            }
        }
    }

    return { success: true };
}
