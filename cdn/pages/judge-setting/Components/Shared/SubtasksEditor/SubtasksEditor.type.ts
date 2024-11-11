import type { E_SubtaskScoringType } from "<Shared>/Enums";

export interface ITestcase {
    uuid: string;
    inputFile?: string;
    outputFile?: string;
    userOutputFilename?: string;
    timeLimit?: number;
    memoryLimit?: number;
    points?: number;
}
export interface ISubtask {
    uuid: string;
    timeLimit?: number;
    memoryLimit?: number;
    testcases: ITestcase[];
    scoringType: E_SubtaskScoringType;
    points?: number;
    dependencies: number[];
}

export interface IJudgeInfoWithSubtasks {
    timeLimit?: number;
    memoryLimit?: number;
    subtasks?: ISubtask[];
}

export interface ISubtasksEditorOptions {
    // Some of the problem types doesn't have ALL testcase props
    enableTimeMemoryLimit: boolean;
    enableInputFile: boolean | "optional";
    enableOutputFile: boolean | "optional";
    enableUserOutputFilename: boolean;
}
