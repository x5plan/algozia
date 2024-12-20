import { Injectable } from "@nestjs/common";

import { CodeLanguageService } from "@/code-language/code-language.service";
import { restrictProperties } from "@/common/utils/restrict-properties";
import { ProblemFileEntity } from "@/problem/problem-file.entity";
import { ISubmissionProgress } from "@/submission/submission.type";

import { IProblemTypeServiceInterface } from "./problem-type.type";
import { autoMatchInputToOutput } from "./problem-type.utils";
import { IProblemJudgeInfoInteraction, ISubmissionTestcaseResultInteraction } from "./problem-type-interaction.type";
import { validateExtraSourceFiles } from "./validators/extra-source-files";
import { validateInteractor } from "./validators/interactor";
import { validateMetaAndSubtasks } from "./validators/meta-and-subtasks";
import { IProblemJudgeInfoValidationResult } from "./validators/type";

@Injectable()
export class ProblemTypeInteractionService
    implements IProblemTypeServiceInterface<IProblemJudgeInfoInteraction, ISubmissionTestcaseResultInteraction>
{
    constructor(private codeLanguageService: CodeLanguageService) {}

    public get defaultJudgeInfo(): IProblemJudgeInfoInteraction {
        return {
            timeLimit: 1000,
            memoryLimit: 512,
            subtasks: null,
            interactor: null,
        };
    }

    public get shouldUploadAnswerFile(): boolean {
        return false;
    }

    public get enableStatistics(): boolean {
        return true;
    }

    public preprocessJudgeInfo(
        judgeInfo: IProblemJudgeInfoInteraction,
        testData: ProblemFileEntity[],
    ): IProblemJudgeInfoInteraction {
        return Array.isArray(judgeInfo.subtasks)
            ? judgeInfo
            : {
                  ...judgeInfo,
                  subtasks: autoMatchInputToOutput(testData, true),
              };
    }

    public validateAndFilterJudgeInfo(
        judgeInfo: IProblemJudgeInfoInteraction,
        testData: ProblemFileEntity[],
    ): IProblemJudgeInfoValidationResult {
        let result: IProblemJudgeInfoValidationResult;

        result = validateMetaAndSubtasks(judgeInfo, testData, {
            enableTimeMemoryLimit: true,
            enableFileIo: true,
            enableInputFile: true,
            enableOutputFile: false,
            enableUserOutputFilename: false,
        });
        if (!result.success) return result;

        result = validateInteractor(judgeInfo, testData, {
            validateCompileAndRunOptions: (language, compileAndRunOptions) =>
                this.codeLanguageService.validateCompileAndRunOptions(language, compileAndRunOptions).length === 0,
        });
        if (!result.success) return result;

        result = validateExtraSourceFiles(judgeInfo, testData);
        if (!result.success) return result;

        restrictProperties(judgeInfo, ["timeLimit", "memoryLimit", "subtasks", "interactor", "extraSourceFiles"]);

        return { success: true };
    }

    public getTimeAndMemoryUsedFromFinishedSubmissionProgress(
        submissionProgress: ISubmissionProgress<ISubmissionTestcaseResultInteraction>,
    ) {
        const result = {
            timeUsed: 0,
            memoryUsed: 0,
        };

        if (submissionProgress) {
            if (Array.isArray(submissionProgress.subtasks)) {
                for (const subtask of submissionProgress.subtasks) {
                    for (const testcase of subtask.testcases) {
                        if (!testcase?.testcaseHash) continue;
                        result.timeUsed += submissionProgress.testcaseResult![testcase.testcaseHash].time!;
                        result.memoryUsed = Math.max(
                            result.memoryUsed,
                            submissionProgress.testcaseResult![testcase.testcaseHash].memory!,
                        );
                    }
                }
            }
        }

        return result;
    }
}
