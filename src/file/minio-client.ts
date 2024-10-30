import { Logger } from "@nestjs/common";
import { Client } from "minio";

import { encodeRFC5987ValueChars } from "@/common/utils/encode";
import type { IMinIOConfig } from "@/config/config.type";

import type { ISharedOssClient, ISignedUploadRequest } from "./file.type";

export class MinioClient implements ISharedOssClient {
    private readonly client: Client;
    private readonly bucket: string;
    private readonly tempBucket: string;

    constructor(config: IMinIOConfig) {
        this.client = new Client({
            endPoint: config.endPoint,
            port: config.port,
            useSSL: config.useSSL,
            accessKey: config.accessKey,
            secretKey: config.secretKey,
            region: "us-east-1",
        });

        this.bucket = config.bucket;
        this.tempBucket = config.tempBucket;
    }

    public async initAsync(): Promise<void> {
        let bucketExists: boolean;
        let tempBucketExists: boolean;

        try {
            bucketExists = await this.client.bucketExists(this.bucket);
            tempBucketExists = await this.client.bucketExists(this.tempBucket);
        } catch (e) {
            throw new Error(
                `Error initializing the MinIO client. Please check your configuration file and MinIO server. ${e}`,
            );
        }

        if (!bucketExists || !tempBucketExists) {
            let notFoundBucketNames = bucketExists ? "" : this.bucket;

            if (!tempBucketExists) {
                if (notFoundBucketNames) {
                    notFoundBucketNames = `${notFoundBucketNames} and ${this.tempBucket}`;
                } else {
                    notFoundBucketNames = this.tempBucket;
                }
            }

            throw new Error(
                `MinIO bucket ${notFoundBucketNames} do${bucketExists || tempBucketExists ? "es" : ""}n't exist. Please check your configuration file and MinIO server.`,
            );
        }

        // Set up the lifecycle rule for the temp bucket to expire files after 1 day if client not reported to save it into the database.
        const tempBucketRuleId = "temp-file-expire";
        const tempBucketLifecycle = await this.client.getBucketLifecycle(this.tempBucket);
        const tempBucketRule = tempBucketLifecycle?.Rule?.find(
            (rule) => rule?.ID === tempBucketRuleId && rule?.Status === "Enabled",
        );

        // Check if the rule is already set up to avoid setting it up again.
        if (!tempBucketRule) {
            await this.client.setBucketLifecycle(this.tempBucket, {
                Rule: [
                    {
                        ID: tempBucketRuleId,
                        Status: "Enabled",
                        Expiration: {
                            Days: 1,
                        },
                    },
                ],
            });
        }
    }

    public async fileExistsAsync(uuid: string, inTempBucket: boolean): Promise<boolean> {
        try {
            await this.client.statObject(inTempBucket ? this.tempBucket : this.bucket, uuid);
            return true;
        } catch {
            return false;
        }
    }

    public async moveTempFileToBucketAsync(uuid: string): Promise<void> {
        await this.client.copyObject(this.bucket, uuid, `/${this.tempBucket}/${uuid}`);
        await this.client.removeObject(this.tempBucket, uuid);
    }

    /**
     * @return A function to run after transaction, to delete the file(s) in MinIO actually.
     */
    public async deleteFileAsync(uuid: string | string[]): Promise<void> {
        if (typeof uuid === "string") {
            await this.client.removeObject(this.bucket, uuid);
        } else if (uuid.length > 0) {
            await this.client.removeObjects(this.bucket, uuid);
        }
    }

    /**
     * Delete a user-uploaded file before calling finishUpload()
     */
    public deleteUnfinishedUploadedFile(uuid: string): void {
        this.client.removeObject(this.bucket, uuid).catch((e) => {
            if (e.message === "The specified key does not exist.") return;
            Logger.error(`Failed to delete unfinished uploaded file ${uuid}: ${e}`);
        });
        this.client.removeObject(this.tempBucket, uuid).catch((e) => {
            if (e.message === "The specified key does not exist.") return;
            Logger.error(`Failed to delete unfinished uploaded file ${uuid}: ${e}`);
        });
    }

    public async signUploadRequestAsync(
        uuid: string,
        size: number,
        expire: number,
        noTemp: boolean,
        signedIdAndSize: string,
        urlReplacer: (url: string) => string,
    ): Promise<ISignedUploadRequest> {
        const policy = this.client.newPostPolicy();
        if (noTemp) {
            policy.setBucket(this.bucket);
        } else {
            policy.setBucket(this.tempBucket);
        }
        policy.setKey(uuid);
        policy.setExpires(new Date(Date.now() + expire * 1000));
        policy.setContentLengthRange(size, size);
        const policyResult = await this.client.presignedPostPolicy(policy);

        return {
            uuid,
            size,
            method: "POST",
            url: urlReplacer(policyResult.postURL),
            extraFormData: policyResult.formData,
            fileFieldName: "file",
            signedIdAndSize,
        };
    }

    public async signDownloadUrlAsync(
        uuid: string,
        expire: number,
        downloadFilename?: string | null,
        urlReplacer?: ((url: string) => string) | null,
    ): Promise<string> {
        const url = await this.client.presignedGetObject(this.bucket, uuid, expire, {
            ...(downloadFilename && {
                "response-content-disposition": `attachment; filename="${encodeRFC5987ValueChars(downloadFilename)}"`,
            }),
        });

        return urlReplacer ? urlReplacer(url) : url;
    }
}
