import { E_CodeLanguage } from "<Shared>/Enums";

import type { IJudgeInfoProcessor } from "../Type";
import type { IJudgeInfoWithExtraSourceFiles } from "./ExtraSourceFilesEditor.type";

export const ExtraSourceFilesJudgeInfoProcessor: IJudgeInfoProcessor<IJudgeInfoWithExtraSourceFiles> = {
    parseJudgeInfo(raw) {
        return {
            extraSourceFiles:
                raw.extraSourceFiles && typeof raw.extraSourceFiles === "object"
                    ? Object.fromEntries(
                          Object.entries(raw.extraSourceFiles)
                              .filter(
                                  ([language, fileMap]) =>
                                      Object.values(E_CodeLanguage).includes(language as E_CodeLanguage) &&
                                      fileMap &&
                                      typeof fileMap === "object",
                              )
                              .map(([language, fileMap]) => [
                                  language,
                                  Object.fromEntries(
                                      Object.entries(fileMap).filter(([, src]) => typeof src === "string"),
                                  ),
                              ])
                              .filter(([, fileMap]) => Object.keys(fileMap).length > 0),
                      )
                    : null,
        };
    },
    normalizeJudgeInfo(judgeInfo) {
        if (!judgeInfo.extraSourceFiles) delete judgeInfo.extraSourceFiles;
    },
};
