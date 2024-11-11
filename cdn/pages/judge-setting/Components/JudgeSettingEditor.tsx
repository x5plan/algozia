import { cloneDeep } from "lodash";
import { useCallback, useMemo, useState } from "preact/hooks";
import React from "react";

import { E_ProblemType } from "../../shared/Enums";
import { InteractionProblemEditor, InteractionProblemJudgeInfoProcessor } from "./InteractionProblemEditor";
import { SubmitAnswerProblemEditor, SubmitAnswerProblemJudgeInfoProcessor } from "./SubmitAnswerProblemEditor";
import { TraditionalProblemEditor, TraditionalProblemJudgeInfoProcessor } from "./TraditionalProblemEditor";

export interface IJudgeInfoEditorProps {
    problemType: E_ProblemType;
    testData: string[];
    judgeInfoRaw: any;
    onUpdateNomalizedJudgeInfo: (judgeInfo: any) => void;
}

export const JudgeInfoEditor: React.FC<IJudgeInfoEditorProps> = (props) => {
    const { problemType, testData, judgeInfoRaw, onUpdateNomalizedJudgeInfo } = props;

    const JudgeInfoEditorComponent = useMemo(() => {
        switch (problemType) {
            case E_ProblemType.Traditional:
                return TraditionalProblemEditor;
            case E_ProblemType.SubmitAnswer:
                return SubmitAnswerProblemEditor;
            case E_ProblemType.Interaction:
                return InteractionProblemEditor;
        }
    }, [problemType]);

    const judgeInfoProcesser = useMemo(() => {
        switch (problemType) {
            case E_ProblemType.Traditional:
                return TraditionalProblemJudgeInfoProcessor;
            case E_ProblemType.SubmitAnswer:
                return SubmitAnswerProblemJudgeInfoProcessor;
            case E_ProblemType.Interaction:
                return InteractionProblemJudgeInfoProcessor;
        }
    }, [problemType]);

    const [judgeInfo, setJudgeInfo] = useState(judgeInfoProcesser.parseJudgeInfo(judgeInfoRaw, testData));

    React.useEffect(() => {
        const cloned = cloneDeep(judgeInfo);
        judgeInfoProcesser.normalizeJudgeInfo(cloned);
        onUpdateNomalizedJudgeInfo(cloned);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [judgeInfo]);

    return (
        <JudgeInfoEditorComponent
            judgeInfo={judgeInfo}
            testData={testData}
            onUpdateJudgeInfo={(deltaOrReducer) =>
                setJudgeInfo((judgeInfo) => ({
                    ...judgeInfo,
                    ...(typeof deltaOrReducer === "function" ? deltaOrReducer(judgeInfo) : deltaOrReducer),
                }))
            }
        />
    );
};
