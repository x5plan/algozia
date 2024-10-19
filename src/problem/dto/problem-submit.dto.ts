import { Transform, Type } from "class-transformer";
import { IsEnum, IsObject, IsOptional, IsString, ValidateNested } from "class-validator";

import { E_CodeLanguage } from "@/code-language/code-language.enum";
import { createJsonTransformer } from "@/common/transformers/json";
import { SignedUploadRequestDto } from "@/file/dto/file-upload-request.dto";
import { ISignedUploadRequest } from "@/file/file.type";

export class ProblemSubmitPostRequestBodyDto {
    @IsEnum(E_CodeLanguage)
    @IsOptional()
    public readonly language?: E_CodeLanguage;

    @IsString()
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
