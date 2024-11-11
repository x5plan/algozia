import type React from "react";

export interface IEditorComponentProps<JudgeInfo, Options = never> {
    options?: Options;
    judgeInfo: JudgeInfo;
    testData: string[];
    onUpdateJudgeInfo: (deltaOrReducer: Partial<JudgeInfo> | ((judgeInfo: JudgeInfo) => Partial<JudgeInfo>)) => void;
}

export type IOptions<TEditorComponentType> = TEditorComponentType extends React.FC<{ options?: infer T }> ? T : never;

export interface IJudgeInfoProcessor<JudgeInfo, Options = never> {
    parseJudgeInfo(rawJudgeInfo: any, testData: string[], options?: Options): Partial<JudgeInfo>;
    normalizeJudgeInfo(judgeInfo: JudgeInfo, options?: Options): void;
}
