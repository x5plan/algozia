import { CheckerJudgeInfoProcessor } from "../Shared/CheckerEditor";
import { MetaJudgeInfoProcessor } from "../Shared/MetaEditor";
import type { MetaEditor } from "../Shared/MetaEditor/MetaEditor";
import type { SubtasksEditor } from "../Shared/SubtasksEditor";
import { SubtaskJudgeInfoProcessor } from "../Shared/SubtasksEditor";
import type { IJudgeInfoProcessor, IOptions } from "../Shared/Type";
import type { IJudgeInfoSubmitAnswer } from "./SubmitAnswerProblemEditor";

export const metaEditorOptions: IOptions<typeof MetaEditor> = {
    enableTimeMemoryLimit: false,
    enableFileIo: false,
};

export const subtasksEditorOptions: IOptions<typeof SubtasksEditor> = {
    enableTimeMemoryLimit: false,
    enableInputFile: "optional",
    enableOutputFile: true,
    enableUserOutputFilename: true,
};

export const SubmitAnswerProblemJudgeInfoProcessor: IJudgeInfoProcessor<IJudgeInfoSubmitAnswer> = {
    parseJudgeInfo(raw, testData) {
        return Object.assign(
            {},
            MetaJudgeInfoProcessor.parseJudgeInfo(raw, testData, metaEditorOptions),
            CheckerJudgeInfoProcessor.parseJudgeInfo(raw, testData),
            SubtaskJudgeInfoProcessor.parseJudgeInfo(raw, testData, subtasksEditorOptions),
        );
    },
    normalizeJudgeInfo(judgeInfo) {
        MetaJudgeInfoProcessor.normalizeJudgeInfo(judgeInfo, metaEditorOptions);
        CheckerJudgeInfoProcessor.normalizeJudgeInfo(judgeInfo);
        SubtaskJudgeInfoProcessor.normalizeJudgeInfo(judgeInfo, subtasksEditorOptions);
    },
};
