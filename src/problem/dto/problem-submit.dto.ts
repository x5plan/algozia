import { Transform } from "class-transformer";
import { IsEnum, IsObject, IsOptional, IsString, Length } from "class-validator";

import { E_CodeLanguage } from "@/code-language/code-language.type";
import { createJsonTransformer } from "@/common/transformers/json";

export class ProblemSubmitPostRequestBodyDto {
    @IsEnum(E_CodeLanguage)
    @IsOptional()
    public readonly language?: E_CodeLanguage;

    @IsString()
    @Length(0, 1024 * 1024)
    @IsOptional()
    public readonly code?: string;

    @IsObject()
    @Transform(createJsonTransformer())
    @IsOptional()
    public readonly compileAndRunOptions?: unknown;

    @IsString()
    @IsOptional()
    public readonly fileUploadToken?: string;
}
