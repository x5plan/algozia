/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Logger } from "@nestjs/common";
import OSS from "ali-oss";

import { encodeRFC5987ValueChars } from "@/common/utils/encode";
import type { IMinIOConfig } from "@/config/config.type";

import type { ISharedOssClient, ISignedUploadRequest } from "./file.type";

export class AliyunClient implements ISharedOssClient {
    private readonly client: OSS;
    private readonly tempClient: OSS;
    private readonly bucket: string;
    private readonly tempBucket: string;

    constructor(config: IMinIOConfig) {
        const options: OSS.Options = {
            endpoint: `${config.useSSL ? "https" : "http"}://${config.endPoint}:${config.port}`,
            accessKeyId: config.accessKey,
            accessKeySecret: config.secretKey,
            secure: config.useSSL,
            // @ts-ignore
            authorizationV4: true,
        };

        this.client = new OSS({
            ...options,
            bucket: config.bucket,
        });
        this.tempClient = new OSS({
            ...options,
            bucket: config.tempBucket,
        });

        this.bucket = config.bucket;
        this.tempBucket = config.tempBucket;
    }

    public async initAsync(): Promise<void> {
        let bucketExists: boolean;
        let tempBucketExists: boolean;

        try {
            bucketExists = await this.bucketExistsAsync(this.client, this.bucket);
            tempBucketExists = await this.bucketExistsAsync(this.tempClient, this.tempBucket);
        } catch (e) {
            throw new Error(
                `Error initializing the Aliyun OSS client. Please check your configuration file and network. ${e}`,
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
                `Aliyun OSS bucket ${notFoundBucketNames} do${bucketExists || tempBucketExists ? "es" : ""}n't exist. Please check your configuration file.`,
            );
        }

        // Set up the lifecycle rule for the temp bucket to expire files after 1 day if client not reported to save it into the database.
        const tempBucketRuleId = "temp-file-expire";
        const tempBucketLifecycle = await this.tempClient.getBucketLifecycle(this.tempBucket);
        const tempBucketRule = tempBucketLifecycle?.rules?.find(
            (rule) => rule?.id === tempBucketRuleId && rule?.status === "Enabled",
        );

        // Check if the rule is already set up to avoid setting it up again.
        if (!tempBucketRule) {
            await this.tempClient.putBucketLifecycle(this.tempBucket, [
                {
                    id: tempBucketRuleId,
                    prefix: "",
                    status: "Enabled",
                    // @ts-ignore
                    expiration: {
                        days: 3,
                    },
                },
            ]);
        }
    }

    public async fileExistsAsync(uuid: string, inTempBucket: boolean): Promise<boolean> {
        const client = inTempBucket ? this.tempClient : this.client;
        try {
            await client.head(uuid);
            return true;
        } catch (error) {
            if (error.code === "NoSuchKey") {
                return false;
            }
            throw error;
        }
    }

    public async moveTempFileToBucketAsync(uuid: string): Promise<void> {
        await this.client.copy(uuid, uuid, this.tempBucket);
        await this.tempClient.delete(uuid);
    }

    public async deleteFileAsync(uuid: string | string[]): Promise<void> {
        if (typeof uuid === "string") {
            await this.client.delete(uuid);
        } else {
            await this.client.deleteMulti(uuid, { quiet: true });
        }
    }

    public deleteUnfinishedUploadedFile(uuid: string): void {
        this.tempClient.delete(uuid).catch((e) => {
            if (e.code === "NoSuchKey") return;
            Logger.error(`Failed to delete unfinished uploaded file ${uuid}: ${e}`);
        });
        this.client.delete(uuid).catch((e) => {
            if (e.code === "NoSuchKey") return;
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
        const url = this.tempClient.signatureUrl(uuid, {
            method: "PUT",
            expires: expire,
            trafficLimit: size,
        });

        return {
            uuid,
            method: "PUT",
            url: urlReplacer(url),
            size,
            signedIdAndSize,
        };
    }

    public async signDownloadUrlAsync(
        uuid: string,
        expire: number,
        downloadFilename?: string | null,
        urlReplacer?: ((url: string) => string) | null,
    ): Promise<string> {
        const url = this.client.signatureUrl(uuid, {
            expires: expire,
            response: downloadFilename
                ? {
                      "content-disposition": `attachment; filename="${encodeRFC5987ValueChars(downloadFilename)}"`,
                  }
                : undefined,
        });

        return urlReplacer ? urlReplacer(url) : url;
    }

    private async bucketExistsAsync(client: OSS, bucket: string): Promise<boolean> {
        try {
            await client.getBucketInfo(bucket);
            return true;
        } catch (error) {
            if (error.name === "NoSuchBucketError") {
                return false;
            } else {
                throw error;
            }
        }
    }
}
