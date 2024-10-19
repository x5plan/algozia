import { Injectable } from "@nestjs/common";

import { CodeLanguageService } from "@/code-language/code-language.service";
import { restrictProperties } from "@/common/utils/restrict-properties";
import { ProblemFileEntity } from "@/problem/problem-file.entity";
import { ISubmissionProgress } from "@/submission/submission.type";

import { CE_JudgeInfoCheckerType } from "./problem-type.enum";
import { IProblemTypeServiceInterface } from "./problem-type.type";
import { autoMatchOutputToInput } from "./problem-type.utils";
import {
    IProblemJudgeInfoSubmitAnswer,
    ISubmissionTestcaseResultSubmitAnswer,
} from "./problem-type-submit-answer.type";
import { validateChecker } from "./validators/checker";
import { validateMetaAndSubtasks } from "./validators/meta-and-subtasks";
import { IProblemJudgeInfoValidationResult } from "./validators/type";

@Injectable()
export class ProblemTypeSubmitAnswerService
    implements IProblemTypeServiceInterface<IProblemJudgeInfoSubmitAnswer, ISubmissionTestcaseResultSubmitAnswer>
{
    constructor(private codeLanguageService: CodeLanguageService) {}

    public get defaultJudgeInfo(): IProblemJudgeInfoSubmitAnswer {
        return {
            subtasks: null,
            checker: {
                type: CE_JudgeInfoCheckerType.Lines,
                caseSensitive: true,
            },
        };
    }

    public get shouldUploadAnswerFile(): boolean {
        return true;
    }

    public get enableStatistics(): boolean {
        return false;
    }

    public preprocessJudgeInfo(
        judgeInfo: IProblemJudgeInfoSubmitAnswer,
        testData: ProblemFileEntity[],
    ): IProblemJudgeInfoSubmitAnswer {
        return Array.isArray(judgeInfo.subtasks)
            ? judgeInfo
            : {
                  ...judgeInfo,
                  subtasks: autoMatchOutputToInput(testData, true),
              };
    }

    public validateAndFilterJudgeInfo(
        judgeInfo: IProblemJudgeInfoSubmitAnswer,
        testData: ProblemFileEntity[],
    ): IProblemJudgeInfoValidationResult {
        let result: IProblemJudgeInfoValidationResult;
        result = validateMetaAndSubtasks(judgeInfo, testData, {
            enableTimeMemoryLimit: false,
            enableFileIo: false,
            enableInputFile: "optional",
            enableOutputFile: true,
            enableUserOutputFilename: true,
        });

        if (!result.success) return result;

        result = validateChecker(judgeInfo, testData, {
            validateCompileAndRunOptions: (language, compileAndRunOptions) =>
                this.codeLanguageService.validateCompileAndRunOptions(language, compileAndRunOptions).length === 0,
        });
        if (!result.success) return result;

        restrictProperties(judgeInfo, ["subtasks", "checker"]);

        return { success: true };
    }

    public getTimeAndMemoryUsedFromFinishedSubmissionProgress(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        submissionProgress: ISubmissionProgress<ISubmissionTestcaseResultSubmitAnswer>,
    ) {
        return {
            timeUsed: null,
            memoryUsed: null,
        };
    }
}
