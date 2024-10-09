import type { ProblemFileEntity } from "@/problem/problem-file.entity";

import type {
    IProblemJudgeInfoOptionalInputTestcase,
    IProblemJudgeInfoOptionalOutputTestcase,
    IProblemJudgeInfoRequiredTestcase,
    IProblemJudgeInfoSubtask,
    IProblemJudgeInfoTestcase,
} from "./problem-type.type";
import { E_ProblemJudgeInfoScoringType } from "./problem-type.type";

interface IAutoMatchedProblemJudgeInfoSubtask<T extends IProblemJudgeInfoTestcase> extends IProblemJudgeInfoSubtask {
    scoringType: E_ProblemJudgeInfoScoringType.Sum;
    testcases: T[];
}

export function autoMatchInputToOutput<T extends boolean | undefined = undefined>(
    testData: ProblemFileEntity[],
    outputOptional?: T,
): IAutoMatchedProblemJudgeInfoSubtask<
    T extends true ? IProblemJudgeInfoOptionalOutputTestcase : IProblemJudgeInfoRequiredTestcase
>[] {
    return [
        {
            scoringType: E_ProblemJudgeInfoScoringType.Sum,
            testcases: testData
                .filter((file) => file.filename.toLowerCase().endsWith(".in"))
                .map<[ProblemFileEntity, ProblemFileEntity | undefined, number[]]>((input) => [
                    input,
                    testData.find((file) =>
                        [".out", ".ans"]
                            .map((ext) => input.filename.slice(0, -3).toLowerCase() + ext)
                            .includes(file.filename.toLowerCase()),
                    ),
                    (input.filename.match(/\d+/g) || []).map(Number),
                ])
                .filter(([, outputFile]) => (outputOptional ? true : outputFile))
                .sort(([inputA, , numbersA], [inputB, , numbersB]) => {
                    const firstNonEqualIndex = [...Array(Math.max(numbersA.length, numbersB.length)).keys()].findIndex(
                        (i) => numbersA[i] !== numbersB[i],
                    );

                    return firstNonEqualIndex === -1
                        ? inputA.filename < inputB.filename
                            ? -1
                            : 1
                        : numbersA[firstNonEqualIndex] - numbersB[firstNonEqualIndex];
                })
                .map(([input, output]) => ({
                    inputFile: input.filename,
                    // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
                    outputFile: output?.filename!, // I'm sure that it is not undefined when outputOptional is not true because of the filter above
                })),
        },
    ];
}

export function autoMatchOutputToInput<T extends boolean | undefined = undefined>(
    testData: ProblemFileEntity[],
    inputOptional?: T,
): IAutoMatchedProblemJudgeInfoSubtask<
    T extends true ? IProblemJudgeInfoOptionalInputTestcase : IProblemJudgeInfoRequiredTestcase
>[] {
    return [
        {
            scoringType: E_ProblemJudgeInfoScoringType.Sum,
            testcases: testData
                .filter((file) =>
                    ((str: string) => str.endsWith(".out") || str.endsWith(".ans"))(file.filename.toLowerCase()),
                )
                .map<[ProblemFileEntity, ProblemFileEntity | undefined, number[]]>((input) => [
                    input,
                    testData.find(
                        (file) => `${input.filename.slice(0, -4).toLowerCase()}.in` === file.filename.toLowerCase(),
                    ),
                    (input.filename.match(/\d+/g) || []).map(Number),
                ])
                .filter(([, inputFile]) => (inputOptional ? true : inputFile))
                .sort(([outputA, , numbersA], [outputB, , numbersB]) => {
                    const firstNonEqualIndex = [...Array(Math.max(numbersA.length, numbersB.length)).keys()].findIndex(
                        (i) => numbersA[i] !== numbersB[i],
                    );

                    return firstNonEqualIndex === -1
                        ? outputA.filename < outputB.filename
                            ? -1
                            : 1
                        : numbersA[firstNonEqualIndex] - numbersB[firstNonEqualIndex];
                })
                .map(([output, input]) => ({
                    // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
                    inputFile: input?.filename!, // I'm sure that it is not undefined when inputOptional is not true because of the filter above
                    outputFile: output.filename,
                })),
        },
    ];
}
