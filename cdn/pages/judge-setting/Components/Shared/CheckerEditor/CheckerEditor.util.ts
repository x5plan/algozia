import {
    checkCodeFileExtension,
    filterValidCompileAndRunOptions,
    getDefaultCompileAndRunOptions,
} from "<Shared>/CodeLanguageUtils";
import { E_CodeLanguage } from "<Shared>/Enums";

import type { IJudgeInfoProcessor } from "../Type";
import type { ICheckerConfig, ICheckerType, IJudgeInfoWithChecker } from "./CheckerEditor.type";

export const CHECKER_TYPES: ICheckerType[] = ["integers", "floats", "lines", "binary", "custom"];
export const CUSTOM_CHECKER_INTERFACES = ["testlib", "legacy", "lemon", "hustoj", "qduoj", "domjudge"];

export function parseCheckerConfig(checker: Partial<ICheckerConfig>, testData: string[]): ICheckerConfig {
    if (!checker || !CHECKER_TYPES.includes(checker.type)) {
        return {
            // default
            type: "lines",
            caseSensitive: true,
        };
    }

    switch (checker.type) {
        case "integers":
            return { type: "integers" };
        case "floats":
            return {
                type: "floats",
                precision: Number.isSafeInteger(checker.precision) && checker.precision > 0 ? checker.precision : 4,
            };
        case "lines":
            return { type: "lines", caseSensitive: checker.caseSensitive ?? true };
        case "binary":
            return { type: "binary" };
        case "custom":
            const language = Object.values(E_CodeLanguage).includes(checker.language)
                ? checker.language
                : E_CodeLanguage.Cpp;
            return {
                type: "custom",
                interface: CUSTOM_CHECKER_INTERFACES.includes(checker.interface)
                    ? checker.interface
                    : CUSTOM_CHECKER_INTERFACES[0],
                language: language,
                compileAndRunOptions:
                    language === checker.language
                        ? filterValidCompileAndRunOptions(language, checker.compileAndRunOptions)
                        : getDefaultCompileAndRunOptions(language),
                filename:
                    checker.filename && typeof checker.filename === "string"
                        ? checker.filename
                        : testData.find((file) => checkCodeFileExtension(language, file)) || testData[0] || "",
                timeLimit: Number.isSafeInteger(checker.timeLimit) ? checker.timeLimit : null,
                memoryLimit: Number.isSafeInteger(checker.memoryLimit) ? checker.memoryLimit : null,
            };
    }
}

export const CheckerJudgeInfoProcessor: IJudgeInfoProcessor<IJudgeInfoWithChecker> = {
    parseJudgeInfo(raw, testData) {
        return {
            checker: parseCheckerConfig(raw.checker, testData),
        };
    },
    normalizeJudgeInfo(judgeInfo) {
        if (judgeInfo.checker.type === "custom") {
            if (judgeInfo.checker.timeLimit == null) delete judgeInfo.checker.timeLimit;
            if (judgeInfo.checker.memoryLimit == null) delete judgeInfo.checker.memoryLimit;
        }
    },
};
