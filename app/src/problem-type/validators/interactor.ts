import type { E_CodeLanguage } from "@/code-language/code-language.type";
import { CE_JudgeInfoValidationMessage } from "@/common/strings/exception";
import { format } from "@/common/utils/format";
import { restrictProperties } from "@/common/utils/restrict-properties";
import { isSafeInt } from "@/common/validators";
import type { ProblemFileEntity } from "@/problem/problem-file.entity";

import { E_ProblemJudgeInfoInteractionInteractorInterface } from "../problem-type-interaction.enum";
import type { IProblemJudgeInfoValidationResult } from "./type";
import { isValidCodeLanguage, isValidInteractorInterface } from "./utils";

interface IProblemJudgeInfoForValidation {
    timeLimit: number;
    memoryLimit: number;

    interactor?: IProblemJudgeInfoInteractionInteractorForValidation | null;
}

interface IProblemJudgeInfoInteractionInteractorForValidation {
    // stdio: The interactor and user's program's stdin and stdout are connected with two pipes
    // shm: A shared memory region is created for interactor and user's program's communication
    interface?: "stdio" | "shm";
    sharedMemorySize?: number;
    language?: E_CodeLanguage;
    compileAndRunOptions?: unknown;
    filename?: string;
    timeLimit?: number;
    memoryLimit?: number;
}

export interface IValidateInteractorOptions {
    validateCompileAndRunOptions: (codeLanguage: E_CodeLanguage, languageOptions: unknown) => boolean;
}

export function validateInteractor(
    judgeInfo: IProblemJudgeInfoForValidation,
    testData: ProblemFileEntity[],
    options: IValidateInteractorOptions,
): IProblemJudgeInfoValidationResult {
    if (!judgeInfo.interactor) {
        return {
            success: false,
            message: CE_JudgeInfoValidationMessage.InvalidInteractor,
        };
    }

    if (!isValidInteractorInterface(judgeInfo.interactor.interface)) {
        return {
            success: false,
            message: CE_JudgeInfoValidationMessage.InvalidInteractorInterface,
        };
    }

    if (judgeInfo.interactor.interface === E_ProblemJudgeInfoInteractionInteractorInterface.shm) {
        if (
            !isSafeInt(judgeInfo.interactor.sharedMemorySize) ||
            judgeInfo.interactor.sharedMemorySize < 4 ||
            judgeInfo.interactor.sharedMemorySize > 128
        ) {
            return {
                success: false,
                message: CE_JudgeInfoValidationMessage.InvalidInteractorSharedMemorySize,
            };
        }
    }

    if (!isValidCodeLanguage(judgeInfo.interactor.language)) {
        return {
            success: false,
            message: CE_JudgeInfoValidationMessage.InvalidInteractorLanguage,
        };
    }

    if (
        !options.validateCompileAndRunOptions(judgeInfo.interactor.language, judgeInfo.interactor.compileAndRunOptions)
    ) {
        return {
            success: false,
            message: CE_JudgeInfoValidationMessage.InvalidInteractorCompileAndRunOptions,
        };
    }

    if (!testData.some((file) => file.filename === judgeInfo.interactor!.filename)) {
        return {
            success: false,
            message: format(
                CE_JudgeInfoValidationMessage.NoSuchInteractorFile,
                judgeInfo.interactor.filename ?? "null",
            ),
        };
    }

    const timeLimit = judgeInfo.interactor.timeLimit;
    if (timeLimit != null && (!isSafeInt(timeLimit) || timeLimit <= 0)) {
        return {
            success: false,
            message: CE_JudgeInfoValidationMessage.InvalidInteractorTimeLimit,
        };
    }

    const memoryLimit = judgeInfo.interactor.memoryLimit;
    if (timeLimit != null && (!isSafeInt(memoryLimit) || memoryLimit <= 0)) {
        return {
            success: false,
            message: CE_JudgeInfoValidationMessage.InvalidInteractorMemoryLimit,
        };
    }

    restrictProperties(judgeInfo.interactor, [
        "interface",
        "sharedMemorySize",
        "language",
        "compileAndRunOptions",
        "filename",
        "timeLimit",
        "memoryLimit",
    ]);

    return { success: true };
}
