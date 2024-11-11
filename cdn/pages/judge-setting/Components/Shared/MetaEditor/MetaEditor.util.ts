import type { IJudgeInfoProcessor } from "../Type";
import type { IJudgeInfoWithMeta, IMetaEditorOptions } from "./MetaEditor.type";

export const MetaJudgeInfoProcessor: IJudgeInfoProcessor<IJudgeInfoWithMeta, IMetaEditorOptions> = {
    parseJudgeInfo(raw, testData, options) {
        return {
            timeLimit: options.enableTimeMemoryLimit && Number.isSafeInteger(raw.timeLimit) ? raw.timeLimit : 1000,
            memoryLimit: options.enableTimeMemoryLimit && Number.isSafeInteger(raw.memoryLimit) ? raw.memoryLimit : 256,
            fileIo:
                options.enableFileIo &&
                raw.fileIo &&
                typeof raw.fileIo.inputFilename === "string" &&
                typeof raw.fileIo.outputFilename === "string"
                    ? {
                          inputFilename: raw.fileIo.inputFilename,
                          outputFilename: raw.fileIo.outputFilename,
                      }
                    : null,
        };
    },
    normalizeJudgeInfo(judgeInfo, options) {
        if (!options.enableTimeMemoryLimit) {
            delete judgeInfo.timeLimit;
            delete judgeInfo.memoryLimit;
        }
        if (!judgeInfo.fileIo) delete judgeInfo.fileIo;
    },
};
