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
    private readonly bucketName: string;
    private readonly tempBucketName: string | null;
    private readonly urlReplacer: (url: string) => string;
    private readonly tempUrlReplacer: (url: string) => string;

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
            pathStyle: config.pathStyle,
            ...(config.region && { region: config.region }),
        });

        this.bucketName = config.bucket.name;
        this.tempBucketName = config.tempBucket ? config.tempBucket.name : null;

        if (config.bucket.publicUrl) {
            const url = new URL(config.bucket.publicUrl);
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

        if (config.tempBucket && config.tempBucket.publicUrl) {
            const url = new URL(config.tempBucket.publicUrl);
            if (url.hash || url.search) {
                throw new Error("Search parameters and hash are not supported for MinIO public URL.");
            }
            if (!url.pathname.endsWith("/")) throw new Error("MinIO public URL's pathname must ends with '/'.");
            this.tempUrlReplacer = (originalUrl) => {
                const parsedUrl = new URL(originalUrl);
                return new URL(parsedUrl.pathname.slice(1) + parsedUrl.search + parsedUrl.hash, url).toString();
            };
        } else {
            this.tempUrlReplacer = (originalUrl) => originalUrl;
        }
    }

    // eslint-disable-next-line @typescript-eslint/naming-convention
    public async onModuleInit(): Promise<void> {
        let bucketExists: boolean;
        let tempBucketExists: boolean = false;

        try {
            bucketExists = await this.minioClient.bucketExists(this.bucketName);
            if (this.tempBucketName) {
                tempBucketExists = await this.minioClient.bucketExists(this.tempBucketName);
            }
        } catch (e) {
            throw new Error(
                `Error initializing the MinIO client. Please check your configuration file and MinIO server. ${e}`,
            );
        }

        if (!bucketExists) {
            throw new Error(
                `MinIO bucket ${this.bucketName} doesn't exist. Please check your configuration file and MinIO server.`,
            );
        }

        if (this.tempBucketName && !tempBucketExists) {
            throw new Error(
                `MinIO bucket ${this.tempBucketName} doesn't exist. Please check your configuration file and MinIO server.`,
            );
        }
    }

    public async findFileByUUIDAsync(uuid: string): Promise<FileEntity | null> {
        return this.fileRepository.findOne({ where: { uuid } });
    }

    public async fileExistsInMinioAsync(uuid: string): Promise<boolean> {
        try {
            await this.minioClient.statObject(this.bucketName, uuid);
            return true;
        } catch {
            return false;
        }
    }

    public async fileExistsInMinioTempBucketAsync(uuid: string): Promise<boolean> {
        if (!this.tempBucketName) throw new Error("Temp bucket is not configured.");

        try {
            await this.minioClient.statObject(this.tempBucketName, uuid);
            return true;
        } catch {
            return false;
        }
    }

    private async moveTempFileToBucketAsync(uuid: string): Promise<void> {
        if (!this.tempBucketName) throw new Error("Temp bucket is not configured.");

        await this.minioClient.copyObject(this.bucketName, uuid, `/${this.tempBucketName}/${uuid}`);
        await this.minioClient.removeObject(this.tempBucketName, uuid);
    }

    /**
     * @return A function to run after transaction, to delete the file(s) in MinIO actually.
     */
    public async deleteFileAsync(uuid: string | string[], entityManager: EntityManager): Promise<() => void> {
        if (typeof uuid === "string") {
            await entityManager.delete(FileEntity, { uuid });

            return () =>
                this.minioClient.removeObject(this.bucketName, uuid).catch((e) => {
                    Logger.error(`Failed to delete file ${uuid}: ${e}`);
                });
        } else if (uuid.length > 0) {
            await entityManager.delete(FileEntity, { uuid: In(uuid) });

            return () =>
                this.minioClient.removeObjects(this.bucketName, uuid).catch((e) => {
                    Logger.error(`Failed to delete file [${uuid}]: ${e}`);
                });
        }

        return () => {
            /* do nothing */
        };
    }

    /**
     * Delete a user-uploaded file before calling reportUploadFinishedAsync()
     */
    public deleteUnfinishedUploadedFile(uuid: string): void {
        if (this.tempBucketName) {
            this.minioClient.removeObject(this.tempBucketName, uuid).catch((e) => {
                if (e.message === "The specified key does not exist.") return;
                Logger.error(`Failed to delete unfinished uploaded file ${uuid}: ${e}`);
            });
        } else {
            this.minioClient.removeObject(this.bucketName, uuid).catch((e) => {
                if (e.message === "The specified key does not exist.") return;
                Logger.error(`Failed to delete unfinished uploaded file ${uuid}: ${e}`);
            });
        }
    }

    public async signUploadRequestAsync(size: number): Promise<ISignedUploadRequest> {
        const uuid = uuidv4();
        const policy = this.minioClient.newPostPolicy();
        if (this.tempBucketName) {
            policy.setBucket(this.tempBucketName);
        } else {
            policy.setBucket(this.bucketName);
        }
        policy.setKey(uuid);
        policy.setExpires(new Date(Date.now() + FILE_UPLOAD_EXPIRE_TIME * 1000));
        policy.setContentLengthRange(size, size);
        const policyResult = await this.minioClient.presignedPostPolicy(policy);
        const token = jwt.sign({ uuid, size }, this.configService.config.security.fileUploadSecret, {
            expiresIn: FILE_UPLOAD_EXPIRE_TIME,
        });

        const replacer = this.tempBucketName ? this.tempUrlReplacer : this.urlReplacer;

        return {
            uuid,
            method: "POST",
            url: replacer(policyResult.postURL),
            extraFormData: policyResult.formData,
            fileFieldName: "file",
            token,
        };
    }

    public async reportUploadFinishedAsync(
        token: string,
        entityManager: EntityManager,
    ): Promise<IFileUploadReportResult> {
        let uuid: string, size: number;
        try {
            const payload: { uuid: string; size: number } = jwt.verify(
                token,
                this.configService.config.security.fileUploadSecret,
            ) as never;
            uuid = payload.uuid;
            size = payload.size;
        } catch {
            return { error: CE_FileUploadError.InvalidToken };
        }

        if (
            (await entityManager.countBy(FileEntity, {
                uuid,
            })) !== 0
        ) {
            return { error: CE_FileUploadError.FileUUIDExists };
        }

        if (this.tempBucketName) {
            if (await this.fileExistsInMinioTempBucketAsync(uuid)) {
                // If the file is in temp bucket, move it to the real bucket.
                await this.moveTempFileToBucketAsync(uuid);
            } else {
                // If the file is not in temp bucket, it's not uploaded.
                return { error: CE_FileUploadError.FileNotFound };
            }
        } else {
            if (!(await this.fileExistsInMinioAsync(uuid))) {
                // If the file is not in the real bucket, it's not uploaded.
                return { error: CE_FileUploadError.FileNotFound };
            }
        }

        const file = new FileEntity();
        file.uuid = uuid;
        file.size = size;
        file.uploadTime = new Date();

        await entityManager.save(FileEntity, file);

        return { file };
    }

    public async signDownloadUrlAsync(uuid: string, downloadFilename?: string, replaceUrl?: boolean): Promise<string> {
        const url = await this.minioClient.presignedGetObject(this.bucketName, uuid, FILE_DOWNLOAD_EXPIRE_TIME, {
            ...(downloadFilename && {
                "response-content-disposition": `attachment; filename="${encodeRFC5987ValueChars(downloadFilename)}"`,
            }),
        });

        return replaceUrl ? this.urlReplacer(url) : url;
    }
}
