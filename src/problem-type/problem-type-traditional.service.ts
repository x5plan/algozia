import { Injectable } from "@nestjs/common";
import { plainToClass } from "class-transformer";
import { validate, ValidationError } from "class-validator";

import { CodeLanguageService } from "@/code-language/code-language.service";
import { ProblemFileEntity } from "@/problem/problem-file.entity";
import { ISubmissionProgress } from "@/submission/submission.type";

import { restrictProperties } from "../common/utils/restrict-properties";
import { CE_JudgeInfoCheckerType } from "./problem-type.enum";
import { IProblemTypeServiceInterface } from "./problem-type.type";
import { autoMatchInputToOutput } from "./problem-type.utils";
import {
    IProblemJudgeInfoTraditional,
    ISubmissionContentTraditional,
    ISubmissionTestcaseResultTraditional,
} from "./problem-type-traditional.type";
import { SubmissionContentTraditionalSchema } from "./submission-content.schema";
import { validateChecker } from "./validators/checker";
import { validateExtraSourceFiles } from "./validators/extra-source-files";
import { validateMetaAndSubtasks } from "./validators/meta-and-subtasks";
import { IProblemJudgeInfoValidationResult } from "./validators/type";

@Injectable()
export class ProblemTypeTraditionalService
    implements
        IProblemTypeServiceInterface<
            IProblemJudgeInfoTraditional,
            ISubmissionContentTraditional,
            ISubmissionTestcaseResultTraditional
        >
{
    constructor(private codeLanguageService: CodeLanguageService) {}

    public get defaultJudgeInfo(): IProblemJudgeInfoTraditional {
        return {
            timeLimit: 1000,
            memoryLimit: 512,
            subtasks: null,
            checker: {
                type: CE_JudgeInfoCheckerType.Lines,
                caseSensitive: true,
            },
        };
    }

    public get shouldUploadAnswerFile(): boolean {
        return false;
    }

    public get enableStatistics(): boolean {
        return true;
    }

    public preprocessJudgeInfo(
        judgeInfo: IProblemJudgeInfoTraditional,
        testData: ProblemFileEntity[],
    ): IProblemJudgeInfoTraditional {
        return Array.isArray(judgeInfo.subtasks)
            ? judgeInfo
            : {
                  ...judgeInfo,
                  subtasks: autoMatchInputToOutput(testData),
              };
    }

    public validateAndFilterJudgeInfo(
        judgeInfo: IProblemJudgeInfoTraditional,
        testData: ProblemFileEntity[],
    ): IProblemJudgeInfoValidationResult {
        let result: IProblemJudgeInfoValidationResult;

        result = validateMetaAndSubtasks(judgeInfo, testData, {
            enableTimeMemoryLimit: true,
            enableFileIo: true,
            enableInputFile: true,
            enableOutputFile: true,
            enableUserOutputFilename: false,
        });

        if (!result.success) return result;

        result = validateChecker(judgeInfo, testData, {
            validateCompileAndRunOptions: (language, compileAndRunOptions) =>
                this.codeLanguageService.validateCompileAndRunOptions(language, compileAndRunOptions).length === 0,
        });

        if (!result.success) return result;

        result = validateExtraSourceFiles(judgeInfo, testData);
        if (!result.success) return result;

        restrictProperties(judgeInfo, [
            "timeLimit",
            "memoryLimit",
            "fileIo",
            "runSamples",
            "subtasks",
            "checker",
            "extraSourceFiles",
        ]);

        restrictProperties(judgeInfo.fileIo, ["inputFilename", "outputFilename"]);

        return { success: true };
    }

    public async validateSubmissionContentAsync(
        submissionContent: ISubmissionContentTraditional,
    ): Promise<ValidationError[]> {
        const errors = await validate(plainToClass(SubmissionContentTraditionalSchema, submissionContent), {
            whitelist: true,
            forbidNonWhitelisted: true,
        });
        if (errors.length > 0) return errors;
        return this.codeLanguageService.validateCompileAndRunOptions(
            submissionContent.language,
            submissionContent.compileAndRunOptions,
        );
    }

    public async getCodeLanguageAndAnswerSizeFromSubmissionContentAndFileAsync(
        submissionContent: ISubmissionContentTraditional,
    ) {
        return {
            language: submissionContent.language,

            // string.length returns the number of charactars in the string
            // Convert to a buffer to get the number of bytes
            answerSize: Buffer.from(submissionContent.code).length,
        };
    }

    // Should called after validateAndFilterJudgeInfo
    public getTimeAndMemoryUsedFromFinishedSubmissionProgress(
        submissionProgress: ISubmissionProgress<ISubmissionTestcaseResultTraditional>,
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
