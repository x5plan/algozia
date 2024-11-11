import React from "react";

import type { IJudgeInfoWithChecker } from "../Shared/CheckerEditor";
import { CheckerEditor } from "../Shared/CheckerEditor/CheckerEditor";
import { ExtraSourceFilesEditor, type IJudgeInfoWithExtraSourceFiles } from "../Shared/ExtraSourceFilesEditor";
import { type IJudgeInfoWithMeta, MetaEditor } from "../Shared/MetaEditor";
import type { IJudgeInfoWithSubtasks } from "../Shared/SubtasksEditor";
import { SubtasksEditor } from "../Shared/SubtasksEditor";
import type { IEditorComponentProps, IOptions } from "../Shared/Type";
import { metaEditorOptions, subtasksEditorOptions } from "./TraditionalProblemEditor.util";

export type IJudgeInfoTraditional = IJudgeInfoWithMeta &
    IJudgeInfoWithSubtasks &
    IJudgeInfoWithChecker &
    IJudgeInfoWithExtraSourceFiles;

export type ITraditionalProblemEditorProps = IEditorComponentProps<IJudgeInfoTraditional>;

export const TraditionalProblemEditor: React.FC<ITraditionalProblemEditorProps> = (props) => {
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
            <ExtraSourceFilesEditor judgeInfo={judgeInfo} testData={testData} onUpdateJudgeInfo={onUpdateJudgeInfo} />
        </>
    );
};
