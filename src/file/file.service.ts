import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import jwt from "jsonwebtoken";
import { EntityManager, In, Repository } from "typeorm";
import { v4 as uuidv4 } from "uuid";

import { ConfigService } from "@/config/config.service";

import { FileEntity } from "./file.entity";
import { CE_FileUploadError, IFileUploadReportResult, ISignedUploadRequest } from "./file.type";
import { MinioClient } from "./minio-client";

const FILE_UPLOAD_EXPIRE_TIME = 10 * 60; // 10 minutes upload expire time
const FILE_DOWNLOAD_EXPIRE_TIME = 20 * 60 * 60; // 20 hours download expire time

@Injectable()
export class FileService implements OnModuleInit {
    private readonly minioClient: MinioClient;
    private readonly urlReplacer: (url: string) => string;

    constructor(
        @InjectRepository(FileEntity)
        private readonly fileRepository: Repository<FileEntity>,
        private readonly configService: ConfigService,
    ) {
        const config = this.configService.config.minio;

        this.minioClient = new MinioClient(config);

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
        await this.minioClient.initAsync();
    }

    public async findFileByUUIDAsync(uuid: string): Promise<FileEntity | null> {
        return this.fileRepository.findOne({ where: { uuid } });
    }

    /**
     * @return A function to run after transaction, to delete the file(s) in MinIO actually.
     */
    public async deleteFileAsync(uuid: string | string[], entityManager: EntityManager): Promise<() => void> {
        if (typeof uuid === "string") {
            await entityManager.delete(FileEntity, { uuid });

            return () =>
                this.minioClient.deleteFileAsync(uuid).catch((e) => {
                    Logger.error(`Failed to delete file ${uuid}: ${e}`);
                });
        } else if (uuid.length > 0) {
            await entityManager.delete(FileEntity, { uuid: In(uuid) });

            return () =>
                this.minioClient.deleteFileAsync(uuid).catch((e) => {
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
        this.minioClient.deleteUnfinishedUploadedFile(uuid);
    }

    public async signUploadRequestAsync(size: number, noTemp = false): Promise<ISignedUploadRequest> {
        const uuid = uuidv4();
        const signedIdAndSize = jwt.sign({ uuid, size }, this.configService.config.security.sessionSecret, {
            expiresIn: FILE_UPLOAD_EXPIRE_TIME,
        });

        return await this.minioClient.signUploadRequestAsync(
            uuid,
            size,
            FILE_UPLOAD_EXPIRE_TIME,
            noTemp,
            signedIdAndSize,
            this.urlReplacer,
        );
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

        if (await this.minioClient.fileExistsAsync(uploadRequest.uuid, true /* inTempBucket */)) {
            // If the file is in temp bucket, move it to the real bucket.
            await this.minioClient.moveTempFileToBucketAsync(uploadRequest.uuid);
        } else if (!(await this.minioClient.fileExistsAsync(uploadRequest.uuid, false))) {
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
        return await this.minioClient.signDownloadUrlAsync(
            uuid,
            FILE_DOWNLOAD_EXPIRE_TIME,
            downloadFilename,
            replaceUrl ? this.urlReplacer : null,
        );
    }
}
