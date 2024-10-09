import { Injectable } from "@nestjs/common";
import { ValidationError } from "class-validator";

import { restrictProperties } from "@/common/utils/restrict-properties";
import { FileEntity } from "@/file/file.entity";
import { ProblemFileEntity } from "@/problem/problem-file.entity";
import { ISubmissionProgress } from "@/submission/submission.type";

import { IProblemTypeServiceInterface } from "./problem-type.type";
import { autoMatchOutputToInput } from "./problem-type.utils";
import {
    IProblemJudgeInfoSubmitAnswer,
    ISubmissionContentSubmitAnswer,
    ISubmissionTestcaseResultSubmitAnswer,
} from "./problem-type-submit-answer.type";
import { validateChecker } from "./validators/checker";
import { validateMetaAndSubtasks } from "./validators/meta-and-subtasks";
import { IProblemJudgeInfoValidationResult } from "./validators/type";

@Injectable()
export class ProblemTypeSubmitAnswerService
    implements
        IProblemTypeServiceInterface<
            IProblemJudgeInfoSubmitAnswer,
            ISubmissionContentSubmitAnswer,
            ISubmissionTestcaseResultSubmitAnswer
        >
{
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor(private codeLanguageService: any) {}

    public get defaultJudgeInfo(): IProblemJudgeInfoSubmitAnswer {
        return {
            subtasks: null,
            checker: {
                type: "lines",
                caseSensitive: false,
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

    public async validateSubmissionContentAsync(): Promise<ValidationError[]> {
        return [];
    }

    public async getCodeLanguageAndAnswerSizeFromSubmissionContentAndFileAsync(
        submissionContent: ISubmissionContentSubmitAnswer,
        file: FileEntity,
    ) {
        return {
            language: null,
            answerSize: file.size,
        };
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
