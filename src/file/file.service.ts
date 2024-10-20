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

        try {
            bucketExists = await this.minioClient.bucketExists(this.bucket);
        } catch (e) {
            throw new Error(
                `Error initializing the MinIO client. Please check your configuration file and MinIO server. ${e}`,
            );
        }

        if (!bucketExists) {
            throw new Error(
                `MinIO bucket ${this.bucket} doesn't exist. Please check your configuration file and MinIO server.`,
            );
        }
    }

    public async findFileByUUIDAsync(uuid: string): Promise<FileEntity | null> {
        return this.fileRepository.findOne({ where: { uuid } });
    }

    public async fileExistsInMinioAsync(uuid: string): Promise<boolean> {
        try {
            await this.minioClient.statObject(this.bucket, uuid);
            return true;
        } catch {
            return false;
        }
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
    }

    public async signUploadRequestAsync(size: number): Promise<ISignedUploadRequest> {
        const uuid = uuidv4();
        const policy = this.minioClient.newPostPolicy();
        policy.setBucket(this.bucket);
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

        if (!(await this.fileExistsInMinioAsync(uploadRequest.uuid))) {
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
