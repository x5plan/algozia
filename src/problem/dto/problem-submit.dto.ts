import { Transform, Type } from "class-transformer";
import { IsEnum, IsObject, IsOptional, IsString, Length, ValidateNested } from "class-validator";

import { E_CodeLanguage } from "@/code-language/code-language.type";
import { createJsonTransformer } from "@/common/transformers/json";
import { SignedUploadRequestDto } from "@/file/dto/file-upload-request.dto";
import { ISignedUploadRequest } from "@/file/file.type";

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

    @Transform(createJsonTransformer())
    @Type(() => SignedUploadRequestDto)
    @ValidateNested()
    @IsOptional()
    public readonly uploadRequest?: ISignedUploadRequest;
}
