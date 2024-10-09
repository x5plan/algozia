import { IsBoolean, IsEnum, IsObject, IsOptional, IsString, Length } from "class-validator";

import { E_CodeLanguage } from "@/code-language/code-language.type";

import { ISubmissionContentTraditional } from "./problem-type-traditional.type";

export class SubmissionContentTraditionalSchema implements ISubmissionContentTraditional {
    @IsString()
    @IsEnum(E_CodeLanguage)
    public readonly language: E_CodeLanguage;

    @IsString()
    @Length(0, 1024 * 1024)
    public readonly code: string;

    @IsObject()
    public readonly compileAndRunOptions: unknown;

    @IsBoolean()
    @IsOptional()
    public readonly skipSamples?: boolean;
}
