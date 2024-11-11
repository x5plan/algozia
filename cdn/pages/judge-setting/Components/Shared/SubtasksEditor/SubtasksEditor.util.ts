import { v4 as uuid } from "uuid";

import { E_SubtaskScoringType } from "<Shared>/Enums";

import type { IJudgeInfoProcessor } from "../Type";
import type { IJudgeInfoWithSubtasks, ISubtasksEditorOptions } from "./SubtasksEditor.type";

export function randomColorFromUuid(uuid: string) {
    const hex = uuid.split("-").join(""),
        COLOR_COUNT = 11;
    let x = 0;
    for (let i = 0; i < hex.length; i += 4) {
        x ^= parseInt(hex.substr(i, 4), 16);
    }
    return x % COLOR_COUNT;
}

export function detectTestcasesByMatchingInputToOutput(testData: string[], outputOptional?: boolean) {
    return testData
        .filter((file) => file.toLowerCase().endsWith(".in"))
        .map<[string, string, number[]]>((input) => [
            input,
            testData.find((file) =>
                [".out", ".ans"].map((ext) => input.slice(0, -3).toLowerCase() + ext).includes(file.toLowerCase()),
            ),
            (input.match(/\d+/g) || []).map(Number),
        ])
        .filter(([, outputFile]) => (outputOptional ? true : outputFile))
        .sort(([inputA, , numbersA], [inputB, , numbersB]) => {
            const firstNonEqualIndex = [...Array(Math.max(numbersA.length, numbersB.length)).keys()].findIndex(
                (i) => numbersA[i] !== numbersB[i],
            );
            return firstNonEqualIndex === -1
                ? inputA < inputB
                    ? -1
                    : 1
                : numbersA[firstNonEqualIndex] - numbersB[firstNonEqualIndex];
        })
        .map(([input, output]) => ({
            inputFile: input,
            outputFile: output,
        }));
}

export function detectTestcasesByMatchingOutputToInput(testData: string[], inputOptional?: boolean) {
    return testData
        .filter((file) => ((str: string) => str.endsWith(".out") || str.endsWith(".ans"))(file.toLowerCase()))
        .map<[string, string, number[]]>((input) => [
            input,
            testData.find((file) => `${input.slice(0, -4).toLowerCase()}.in` === file.toLowerCase()),
            (input.match(/\d+/g) || []).map(Number),
        ])
        .filter(([, inputFile]) => (inputOptional ? true : inputFile))
        .sort(([outputA, , numbersA], [outputB, , numbersB]) => {
            const firstNonEqualIndex = [...Array(Math.max(numbersA.length, numbersB.length)).keys()].findIndex(
                (i) => numbersA[i] !== numbersB[i],
            );
            return firstNonEqualIndex === -1
                ? outputA < outputB
                    ? -1
                    : 1
                : numbersA[firstNonEqualIndex] - numbersB[firstNonEqualIndex];
        })
        .map(([output, input]) => ({
            inputFile: input,
            outputFile: output,
        }));
}

export const SubtaskJudgeInfoProcessor: IJudgeInfoProcessor<IJudgeInfoWithSubtasks, ISubtasksEditorOptions> = {
    parseJudgeInfo(raw, testData, options) {
        const subtaskCount = Array.isArray(raw.subtasks) ? raw.subtasks.length : 0;
        return {
            subtasks:
                Array.isArray(raw.subtasks) && raw.subtasks.length > 0
                    ? (raw.subtasks as any[])
                          .map((x) => x || {})
                          .map((rawSubtask) => ({
                              uuid: rawSubtask.uuid || uuid(),
                              scoringType:
                                  rawSubtask.scoringType in E_SubtaskScoringType
                                      ? rawSubtask.scoringType
                                      : E_SubtaskScoringType.Sum,
                              points:
                                  Number.isSafeInteger(rawSubtask.points) && raw.subtasks.length > 1
                                      ? rawSubtask.points
                                      : null,
                              timeLimit:
                                  options.enableTimeMemoryLimit && Number.isSafeInteger(rawSubtask.timeLimit)
                                      ? rawSubtask.timeLimit
                                      : null,
                              memoryLimit:
                                  options.enableTimeMemoryLimit && Number.isSafeInteger(rawSubtask.memoryLimit)
                                      ? rawSubtask.memoryLimit
                                      : null,
                              dependencies: Array.isArray(rawSubtask.dependencies)
                                  ? (rawSubtask.dependencies as any[]).filter(
                                        (id) => typeof id === "number" && id >= 0 && id < subtaskCount,
                                    )
                                  : [],
                              testcases: Array.isArray(rawSubtask.testcases)
                                  ? (rawSubtask.testcases as any[])
                                        .map((x) => x || {})
                                        .map((rawTestcase) => ({
                                            uuid: rawSubtask.uuid || uuid(),
                                            inputFile:
                                                options.enableInputFile && typeof rawTestcase.inputFile === "string"
                                                    ? rawTestcase.inputFile
                                                    : "",
                                            outputFile:
                                                options.enableOutputFile && typeof rawTestcase.outputFile === "string"
                                                    ? rawTestcase.outputFile
                                                    : "",
                                            userOutputFilename:
                                                options.enableUserOutputFilename &&
                                                typeof rawTestcase.userOutputFilename === "string"
                                                    ? rawTestcase.userOutputFilename
                                                    : "",
                                            points:
                                                Number.isSafeInteger(rawTestcase.points) &&
                                                rawSubtask.testcases.length > 0
                                                    ? rawTestcase.points
                                                    : null,
                                            timeLimit:
                                                options.enableTimeMemoryLimit &&
                                                Number.isSafeInteger(rawTestcase.timeLimit)
                                                    ? rawTestcase.timeLimit
                                                    : null,
                                            memoryLimit:
                                                options.enableTimeMemoryLimit &&
                                                Number.isSafeInteger(rawTestcase.memoryLimit)
                                                    ? rawTestcase.memoryLimit
                                                    : null,
                                        }))
                                  : [],
                          }))
                    : null,
        };
    },
    normalizeJudgeInfo(judgeInfo, options) {
        if (judgeInfo.subtasks) {
            for (const subtask of judgeInfo.subtasks) {
                delete subtask.uuid;
                if (subtask.points == null) delete subtask.points;
                if (!options.enableTimeMemoryLimit || subtask.timeLimit == null) delete subtask.timeLimit;
                if (!options.enableTimeMemoryLimit || subtask.memoryLimit == null) delete subtask.memoryLimit;
                if (subtask.dependencies == null || subtask.dependencies.length === 0) delete subtask.dependencies;
                for (const testcase of subtask.testcases) {
                    delete testcase.uuid;
                    if (testcase.points == null) delete testcase.points;

                    if (!options.enableInputFile) delete testcase.inputFile;
                    else if (!testcase.inputFile) testcase.inputFile = null;

                    if (!options.enableOutputFile) delete testcase.outputFile;
                    else if (!testcase.outputFile) testcase.outputFile = null;

                    if (!options.enableUserOutputFilename || !testcase.userOutputFilename) {
                        delete testcase.userOutputFilename;
                    }
                    if (!options.enableTimeMemoryLimit || testcase.timeLimit == null) delete testcase.timeLimit;
                    if (!options.enableTimeMemoryLimit || testcase.memoryLimit == null) delete testcase.memoryLimit;
                }
            }
        } else delete judgeInfo.subtasks;
    },
};
