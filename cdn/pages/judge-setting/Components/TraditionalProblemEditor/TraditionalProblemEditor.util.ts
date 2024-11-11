import { CheckerJudgeInfoProcessor } from "../Shared/CheckerEditor";
import { ExtraSourceFilesJudgeInfoProcessor } from "../Shared/ExtraSourceFilesEditor";
import type { MetaEditor } from "../Shared/MetaEditor";
import { MetaJudgeInfoProcessor } from "../Shared/MetaEditor";
import type { SubtasksEditor } from "../Shared/SubtasksEditor";
import { SubtaskJudgeInfoProcessor } from "../Shared/SubtasksEditor";
import type { IJudgeInfoProcessor, IOptions } from "../Shared/Type";
import type { IJudgeInfoTraditional } from "./TraditionalProblemEditor";

export const metaEditorOptions: IOptions<typeof MetaEditor> = {
    enableTimeMemoryLimit: true,
    enableFileIo: true,
};

export const subtasksEditorOptions: IOptions<typeof SubtasksEditor> = {
    enableTimeMemoryLimit: true,
    enableInputFile: true,
    enableOutputFile: true,
    enableUserOutputFilename: false,
};

export const TraditionalProblemJudgeInfoProcessor: IJudgeInfoProcessor<IJudgeInfoTraditional> = {
    parseJudgeInfo(raw, testData) {
        return Object.assign(
            {},
            MetaJudgeInfoProcessor.parseJudgeInfo(raw, testData, metaEditorOptions),
            CheckerJudgeInfoProcessor.parseJudgeInfo(raw, testData),
            SubtaskJudgeInfoProcessor.parseJudgeInfo(raw, testData, subtasksEditorOptions),
            ExtraSourceFilesJudgeInfoProcessor.parseJudgeInfo(raw, testData),
        );
    },
    normalizeJudgeInfo(judgeInfo) {
        MetaJudgeInfoProcessor.normalizeJudgeInfo(judgeInfo, metaEditorOptions);
        CheckerJudgeInfoProcessor.normalizeJudgeInfo(judgeInfo);
        SubtaskJudgeInfoProcessor.normalizeJudgeInfo(judgeInfo, subtasksEditorOptions);
        ExtraSourceFilesJudgeInfoProcessor.normalizeJudgeInfo(judgeInfo);
    },
};
