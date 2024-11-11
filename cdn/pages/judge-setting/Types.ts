import type { E_ProblemType } from "<Shared>/Enums";

interface IChangeTypeMessageData {
    type: "ChangeType";
    problemType: E_ProblemType;
}

interface IInitializeMessageData {
    type: "Initialize";
    problemType: E_ProblemType;
    judgeInfo: any;
    testData: string[];
}

interface ISubmitJudgeInfoMessageData {
    type: "SubmitJudgeInfo";
}

interface IUpdateJudgeInfoMessageData {
    type: "UpdateJudgeInfo";
    judgeInfo: any;
}

export type IJudgeSettingEditorMessageData =
    | IChangeTypeMessageData
    | IInitializeMessageData
    | ISubmitJudgeInfoMessageData
    | IUpdateJudgeInfoMessageData;

export interface IPageSharedObject {
    readonly title: string;
    readonly problemUrl: string;
    readonly postUrl: string;
    readonly error?: string;
    readonly type: string;
    readonly info: any;
    readonly hasSubmissions: boolean;
    readonly testDataFileNames: string[];
}
