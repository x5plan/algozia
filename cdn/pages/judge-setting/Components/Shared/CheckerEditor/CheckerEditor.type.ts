import type { E_CodeLanguage } from "<Shared>/Enums";

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
    compileAndRunOptions: Record<string, unknown>;
    filename: string;
    timeLimit?: number;
    memoryLimit?: number;
}

export type ICheckerConfig =
    | ICheckerTypeIntegers
    | ICheckerTypeFloats
    | ICheckerTypeLines
    | ICheckerTypeBinary
    | ICheckerTypeCustom;

export type ICheckerType = ICheckerConfig["type"];

export interface IJudgeInfoWithChecker {
    checker?: ICheckerConfig;
}
