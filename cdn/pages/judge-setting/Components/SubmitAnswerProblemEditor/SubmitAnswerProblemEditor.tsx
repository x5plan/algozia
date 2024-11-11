import type React from "react";

import type { IJudgeInfoWithChecker } from "../Shared/CheckerEditor";
import { CheckerEditor } from "../Shared/CheckerEditor";
import type { IJudgeInfoWithMeta } from "../Shared/MetaEditor";
import { MetaEditor } from "../Shared/MetaEditor";
import type { IJudgeInfoWithSubtasks } from "../Shared/SubtasksEditor";
import { SubtasksEditor } from "../Shared/SubtasksEditor";
import type { IEditorComponentProps } from "../Shared/Type";
import { metaEditorOptions, subtasksEditorOptions } from "./SubmitAnswerProblemEditor.util";

export type IJudgeInfoSubmitAnswer = IJudgeInfoWithMeta & IJudgeInfoWithSubtasks & IJudgeInfoWithChecker;

export type ISubmitAnswerProblemEditorProps = IEditorComponentProps<IJudgeInfoSubmitAnswer>;

export const SubmitAnswerProblemEditor: React.FC<ISubmitAnswerProblemEditorProps> = (props) => {
    const { testData, judgeInfo, onUpdateJudgeInfo } = props;

    return (
        <>
            <MetaEditor
                judgeInfo={judgeInfo}
                testData={testData}
                onUpdateJudgeInfo={onUpdateJudgeInfo}
                options={metaEditorOptions}
            />
            <CheckerEditor judgeInfo={judgeInfo} testData={testData} onUpdateJudgeInfo={onUpdateJudgeInfo} />
            <SubtasksEditor
                judgeInfo={judgeInfo}
                testData={testData}
                onUpdateJudgeInfo={onUpdateJudgeInfo}
                options={subtasksEditorOptions}
            />
        </>
    );
};
