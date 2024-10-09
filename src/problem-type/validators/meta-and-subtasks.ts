import { isArray, isNumber, isString } from "class-validator";
import toposort from "toposort";
import type { PartialDeep } from "type-fest";

import { CE_JudgeInfoValidationMessage } from "@/common/strings/judge-info-validation-message";
import { format } from "@/common/utils/format";
import { isSafeInt, isValidFilename } from "@/common/validators";
import type { ProblemFileEntity } from "@/problem/problem-file.entity";

import { restrictProperties } from "../../common/utils/restrict-properties";
import type { IProblemJudgeInfo, IProblemJudgeInfoSubtask, IProblemJudgeInfoTestcase } from "../problem-type.type";
import type { IProblemJudgeInfoValidationResult } from "./type";
import { isValidScoringType } from "./utils";

interface IProblemJudgeInfoForValidation extends PartialDeep<IProblemJudgeInfo, { recurseIntoArrays: true }> {
    timeLimit?: number;
    memoryLimit?: number;

    fileIo?: {
        inputFilename?: string;
        outputFilename?: string;
    };

    subtasks?: IProblemJudgeInfoSubtaskForValidation[] | null;
}

interface IProblemJudgeInfoSubtaskForValidation
    extends PartialDeep<IProblemJudgeInfoSubtask, { recurseIntoArrays: true }> {
    timeLimit?: number;
    memoryLimit?: number;

    testcases?: IProblemJudgeInfoTestcaseForValidation[];
}

interface IProblemJudgeInfoTestcaseForValidation extends PartialDeep<IProblemJudgeInfoTestcase> {
    userOutputFilename?: string;

    timeLimit?: number;
    memoryLimit?: number;
}

interface IValidateMetaAndSubtasksOptions {
    enableTimeMemoryLimit: boolean;
    enableFileIo: boolean;
    enableInputFile: boolean | "optional";
    enableOutputFile: boolean | "optional";
    enableUserOutputFilename: boolean;
}

export function validateMetaAndSubtasks(
    judgeInfo: IProblemJudgeInfoForValidation,
    testData: ProblemFileEntity[],
    options: IValidateMetaAndSubtasksOptions,
): IProblemJudgeInfoValidationResult {
    const validateTimeLimit = (
        timeLimit: number | undefined | null,
        scope: "TASK" | "SUBTASK" | "TESTCASE",
    ): IProblemJudgeInfoValidationResult => {
        if (scope !== "TASK" && timeLimit == null) return { success: true };
        if (!isSafeInt(timeLimit) || timeLimit <= 0) {
            return {
                success: false,
                message: CE_JudgeInfoValidationMessage.InvalidTimeLimitOnTaskOrCase,
            };
        }

        return { success: true };
    };

    const validateMemoryLimit = (
        memoryLimit: number | undefined | null,
        scope: "TASK" | "SUBTASK" | "TESTCASE",
    ): IProblemJudgeInfoValidationResult => {
        if (scope !== "TASK" && memoryLimit == null) return { success: true };
        if (!isSafeInt(memoryLimit) || memoryLimit <= 0) {
            return {
                success: false,
                message: CE_JudgeInfoValidationMessage.InvalidMemoryLimitOnTaskOrCase,
            };
        }

        return { success: true };
    };

    let result: IProblemJudgeInfoValidationResult;

    if (options.enableTimeMemoryLimit) {
        result = validateTimeLimit(judgeInfo.timeLimit, "TASK");
        if (!result.success) return result;
        result = validateMemoryLimit(judgeInfo.memoryLimit, "TASK");
        if (!result.success) return result;
    }

    if (options.enableFileIo && judgeInfo.fileIo) {
        if (!isValidFilename(judgeInfo.fileIo.inputFilename)) {
            return {
                success: false,
                message: format(
                    CE_JudgeInfoValidationMessage.InvalidFileIOFilename,
                    judgeInfo.fileIo.inputFilename ?? "null",
                ),
            };
        }
        if (!isValidFilename(judgeInfo.fileIo.outputFilename)) {
            return {
                success: false,
                message: format(
                    CE_JudgeInfoValidationMessage.InvalidFileIOFilename,
                    judgeInfo.fileIo.outputFilename ?? "null",
                ),
            };
        }
    }

    if (judgeInfo.subtasks && !judgeInfo.subtasks.length) {
        return { success: false, message: CE_JudgeInfoValidationMessage.NoTestcases };
    }

    // Used to check duplicated user output filenames
    const userOutputFilenames: [filename: string, subtaskIndex: number, testcaseIndex: number][] = [];

    // [A, B] means B depends on A
    const edges: [number, number][] = [];
    const subtasks = judgeInfo.subtasks || [];
    for (let i = 0; i < subtasks.length; i++) {
        const subtask = subtasks[i];
        const { timeLimit, memoryLimit, scoringType, points, dependencies, testcases } = subtask;

        if (options.enableTimeMemoryLimit) {
            if (timeLimit != null) {
                result = validateTimeLimit(timeLimit, "SUBTASK");
                if (!result.success) return result;
            }
            if (memoryLimit != null) {
                result = validateMemoryLimit(memoryLimit, "SUBTASK");
                if (!result.success) return result;
            }
        } else {
            delete subtask.timeLimit;
            delete subtask.memoryLimit;
        }

        if (!isValidScoringType(scoringType)) {
            return {
                success: false,
                message: format(CE_JudgeInfoValidationMessage.InvalidScoringType, scoringType ?? "null"),
            };
        }

        if (points != null && (isNumber(points) || points < 0 || points > 100)) {
            return {
                success: false,
                message: format(CE_JudgeInfoValidationMessage.InvalidPointsSubtask, i + 1, points),
            };
        }

        if (isArray(dependencies)) {
            for (const dependency of dependencies) {
                if (!isSafeInt(dependency) || dependency < 0 || dependency >= subtasks.length) {
                    return {
                        success: false,
                        message: CE_JudgeInfoValidationMessage.InvalidDependency,
                    };
                }
                edges.push([dependency, i]);
            }
        } else delete subtask.dependencies;

        if (!isArray(testcases) || testcases.length === 0) {
            return {
                success: false,
                message: format(CE_JudgeInfoValidationMessage.NoTestcases, i + 1),
            };
        }

        restrictProperties(subtask, ["timeLimit", "memoryLimit", "scoringType", "points", "dependencies", "testcases"]);

        for (let j = 0; j < testcases.length; j++) {
            const testcase = testcases[j];
            const { inputFile, outputFile, userOutputFilename, timeLimit, memoryLimit, points } = testcase;

            if (options.enableInputFile) {
                if (
                    !(
                        testData.some((file) => file.filename === inputFile) ||
                        (inputFile == null && options.enableInputFile === "optional")
                    )
                ) {
                    return {
                        success: false,
                        message: format(CE_JudgeInfoValidationMessage.NoSuchInputFile, inputFile ?? "null"),
                    };
                }
            } else delete testcase.inputFile;

            if (options.enableOutputFile) {
                if (
                    !(
                        testData.some((file) => file.filename === outputFile) ||
                        (outputFile == null && options.enableOutputFile === "optional")
                    )
                ) {
                    return {
                        success: false,
                        message: format(CE_JudgeInfoValidationMessage.NoSuchOutputFile, outputFile ?? "null"),
                    };
                }
            } else delete testcase.outputFile;

            if (options.enableUserOutputFilename) {
                if (
                    (!isString(userOutputFilename) && userOutputFilename != null) ||
                    (userOutputFilename && !isValidFilename(userOutputFilename))
                ) {
                    return {
                        success: false,
                        message: format(CE_JudgeInfoValidationMessage.InvalidUserOutputFilename, userOutputFilename),
                    };
                }

                const realUserOutputFilename = userOutputFilename || outputFile!;
                if (userOutputFilenames.findIndex(([filename]) => filename === realUserOutputFilename) !== -1) {
                    return {
                        success: false,
                        message: format(
                            CE_JudgeInfoValidationMessage.DuplicateUserOutputFilename,
                            realUserOutputFilename,
                        ),
                    };
                }

                userOutputFilenames.push([realUserOutputFilename, i, j]);
            } else delete testcase.userOutputFilename;

            if (options.enableTimeMemoryLimit) {
                if (timeLimit != null) {
                    result = validateTimeLimit(timeLimit, "TESTCASE");
                    if (!result.success) return result;
                }
                if (memoryLimit != null) {
                    result = validateMemoryLimit(memoryLimit, "TESTCASE");
                    if (!result.success) return result;
                }
            } else {
                delete testcase.timeLimit;
                delete testcase.memoryLimit;
            }

            if (points != null && (!isNumber(points) || points < 0 || points > 100)) {
                return {
                    success: false,
                    message: format(CE_JudgeInfoValidationMessage.InvalidPointsTestcase, i + 1, j + 1, points),
                };
            }

            restrictProperties(testcase, [
                "inputFile",
                "outputFile",
                "userOutputFilename",
                "timeLimit",
                "memoryLimit",
                "points",
            ]);
        }

        const sum = testcases.reduce((s, { points }) => (points ? s + points : s), 0);
        if (sum > 100) {
            return {
                success: false,
                message: format(CE_JudgeInfoValidationMessage.PointsSumUpToLargerThan100Testcases, i + 1),
            };
        }
    }
    const sum = (judgeInfo.subtasks || []).reduce((s, { points }) => (points ? s + points : s), 0);
    if (sum > 100) {
        return {
            success: false,
            message: format(CE_JudgeInfoValidationMessage.PointsSumUpToLargerThan100Subtasks, sum),
        };
    }

    try {
        toposort.array(
            (judgeInfo.subtasks || []).map((subtask, i) => i),
            edges,
        );
    } catch {
        return {
            success: false,
            message: CE_JudgeInfoValidationMessage.CyclicalSubtaskDependency,
        };
    }

    return { success: true };
}
