import { IsIn, IsNumber, IsOptional, IsString, IsUUID } from "class-validator";

import { ISignedUploadRequest } from "../file.type";

export class SignedUploadRequestDto implements ISignedUploadRequest {
    @IsUUID()
    public uuid: string;

    @IsIn(["POST", "PUT"])
    @IsOptional()
    public method: "POST" | "PUT";

    @IsString()
    @IsOptional()
    public url: string;

    @IsNumber()
    public size: number;

    @IsOptional()
    public extraFormData?: unknown;

    @IsString()
    @IsOptional()
    public fileFieldName?: string;
}
