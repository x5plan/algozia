import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import jwt from "jsonwebtoken";
import { Client as MinioClient } from "minio";
import { EntityManager, In, Repository } from "typeorm";
import { v4 as uuidv4 } from "uuid";

import { encodeRFC5987ValueChars } from "@/common/utils/encode";
import { ConfigService } from "@/config/config.service";

import { FileEntity } from "./file.entity";
import { CE_FileUploadError, IFileUploadReportResult, ISignedUploadRequest } from "./file.type";

const FILE_UPLOAD_EXPIRE_TIME = 10 * 60; // 10 minutes upload expire time
const FILE_DOWNLOAD_EXPIRE_TIME = 20 * 60 * 60; // 20 hours download expire time

@Injectable()
export class FileService implements OnModuleInit {
    private readonly minioClient: MinioClient;
    private readonly bucket: string;
    private readonly tempBucket: string;
    private readonly urlReplacer: (url: string) => string;

    constructor(
        @InjectRepository(FileEntity)
        private readonly fileRepository: Repository<FileEntity>,
        private readonly configService: ConfigService,
    ) {
        const config = this.configService.config.minio;

        this.minioClient = new MinioClient({
            endPoint: config.endPoint,
            port: config.port,
            useSSL: config.useSSL,
            accessKey: config.accessKey,
            secretKey: config.secretKey,
            region: "us-east-1",
        });

        this.bucket = config.bucket;
        this.tempBucket = config.tempBucket;

        if (config.publicUrlEndPoint) {
            const url = new URL(config.publicUrlEndPoint);
            if (url.hash || url.search) {
                throw new Error("Search parameters and hash are not supported for MinIO public URL.");
            }
            if (!url.pathname.endsWith("/")) throw new Error("MinIO public URL's pathname must ends with '/'.");
            this.urlReplacer = (originalUrl) => {
                const parsedUrl = new URL(originalUrl);
                return new URL(parsedUrl.pathname.slice(1) + parsedUrl.search + parsedUrl.hash, url).toString();
            };
        } else {
            this.urlReplacer = (originalUrl) => originalUrl;
        }
    }

    // eslint-disable-next-line @typescript-eslint/naming-convention
    public async onModuleInit(): Promise<void> {
        let bucketExists: boolean;
        let tempBucketExists: boolean;

        try {
            bucketExists = await this.minioClient.bucketExists(this.bucket);
            tempBucketExists = await this.minioClient.bucketExists(this.tempBucket);
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
        const tempBucketLifecycle = await this.minioClient.getBucketLifecycle(this.tempBucket);
        const tempBucketRule = tempBucketLifecycle?.Rule?.find(
            (rule) => rule?.ID === tempBucketRuleId && rule?.Status === "Enabled",
        );

        // Check if the rule is already set up to avoid setting it up again.
        if (!tempBucketRule) {
            await this.minioClient.setBucketLifecycle(this.tempBucket, {
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

    public async findFileByUUIDAsync(uuid: string): Promise<FileEntity | null> {
        return this.fileRepository.findOne({ where: { uuid } });
    }

    public async fileExistsInMinioAsync(uuid: string, inTempBucket = false): Promise<boolean> {
        try {
            await this.minioClient.statObject(inTempBucket ? this.tempBucket : this.bucket, uuid);
            return true;
        } catch {
            return false;
        }
    }

    private async moveTempFileToBucketAsync(uuid: string): Promise<void> {
        await this.minioClient.copyObject(this.bucket, uuid, `/${this.tempBucket}/${uuid}`);
        await this.minioClient.removeObject(this.tempBucket, uuid);
    }

    /**
     * @return A function to run after transaction, to delete the file(s) in MinIO actually.
     */
    public async deleteFileAsync(uuid: string | string[], entityManager: EntityManager): Promise<() => void> {
        if (typeof uuid === "string") {
            await entityManager.delete(FileEntity, { uuid });

            return () =>
                this.minioClient.removeObject(this.bucket, uuid).catch((e) => {
                    Logger.error(`Failed to delete file ${uuid}: ${e}`);
                });
        } else if (uuid.length > 0) {
            await entityManager.delete(FileEntity, { uuid: In(uuid) });

            return () =>
                this.minioClient.removeObjects(this.bucket, uuid).catch((e) => {
                    Logger.error(`Failed to delete file [${uuid}]: ${e}`);
                });
        }

        return () => {
            /* do nothing */
        };
    }

    /**
     * Delete a user-uploaded file before calling finishUpload()
     */
    public deleteUnfinishedUploadedFile(uuid: string): void {
        this.minioClient.removeObject(this.bucket, uuid).catch((e) => {
            if (e.message === "The specified key does not exist.") return;
            Logger.error(`Failed to delete unfinished uploaded file ${uuid}: ${e}`);
        });
        this.minioClient.removeObject(this.tempBucket, uuid).catch((e) => {
            if (e.message === "The specified key does not exist.") return;
            Logger.error(`Failed to delete unfinished uploaded file ${uuid}: ${e}`);
        });
    }

    public async signUploadRequestAsync(size: number, noTemp = false): Promise<ISignedUploadRequest> {
        const uuid = uuidv4();
        const policy = this.minioClient.newPostPolicy();
        if (noTemp) {
            policy.setBucket(this.bucket);
        } else {
            policy.setBucket(this.tempBucket);
        }
        policy.setKey(uuid);
        policy.setExpires(new Date(Date.now() + FILE_UPLOAD_EXPIRE_TIME * 1000));
        policy.setContentLengthRange(size, size);
        const policyResult = await this.minioClient.presignedPostPolicy(policy);
        const signedIdAndSize = jwt.sign({ uuid, size }, this.configService.config.security.sessionSecret, {
            expiresIn: FILE_UPLOAD_EXPIRE_TIME,
        });

        return {
            uuid,
            size,
            method: "POST",
            url: this.urlReplacer(policyResult.postURL),
            extraFormData: policyResult.formData,
            fileFieldName: "file",
            signedIdAndSize,
        };
    }

    public async reportUploadFinishedAsync(
        uploadRequest: ISignedUploadRequest,
        entityManager: EntityManager,
    ): Promise<IFileUploadReportResult> {
        try {
            const { uuid, size } = jwt.verify(
                uploadRequest.signedIdAndSize,
                this.configService.config.security.sessionSecret,
            ) as { uuid: string; size: number };

            if (uuid !== uploadRequest.uuid || size !== uploadRequest.size) {
                return { error: CE_FileUploadError.InvalidSignedData };
            }
        } catch {
            return { error: CE_FileUploadError.InvalidSignedData };
        }

        if (
            (await entityManager.countBy(FileEntity, {
                uuid: uploadRequest.uuid,
            })) !== 0
        ) {
            return { error: CE_FileUploadError.FileUUIDExists };
        }

        if (await this.fileExistsInMinioAsync(uploadRequest.uuid, true /* inTempBucket */)) {
            // If the file is in temp bucket, move it to the real bucket.
            await this.moveTempFileToBucketAsync(uploadRequest.uuid);
        } else if (!(await this.fileExistsInMinioAsync(uploadRequest.uuid, false))) {
            // If the file is not in temp bucket and not in the real bucket, it's not uploaded.
            return { error: CE_FileUploadError.FileNotFound };
        }

        const file = new FileEntity();
        file.uuid = uploadRequest.uuid;
        file.size = uploadRequest.size;
        file.uploadTime = new Date();

        await entityManager.save(FileEntity, file);

        return { file };
    }

    public async signDownloadUrlAsync(uuid: string, downloadFilename?: string, replaceUrl?: boolean): Promise<string> {
        const url = await this.minioClient.presignedGetObject(this.bucket, uuid, FILE_DOWNLOAD_EXPIRE_TIME, {
            ...(downloadFilename && {
                "response-content-disposition": `attachment; filename="${encodeRFC5987ValueChars(downloadFilename)}"`,
            }),
        });

        return replaceUrl ? this.urlReplacer(url) : url;
    }
}
