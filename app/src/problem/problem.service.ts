import { forwardRef, Inject, Injectable } from "@nestjs/common";
import { InjectDataSource, InjectRepository } from "@nestjs/typeorm";
import { isInt } from "class-validator";
import { DataSource, Repository } from "typeorm";

import { InvalidProblemTypeException, NoSuchProblemFileException } from "@/common/exceptions/problem";
import { CE_Order } from "@/common/types/order";
import { format } from "@/common/utils/format";
import { ConfigService } from "@/config/config.service";
import { FileService } from "@/file/file.service";
import { CE_FileUploadError } from "@/file/file.type";
import { CE_CommonPermission, CE_SpecificPermission } from "@/permission/permission.enum";
import { E_Visibility } from "@/permission/permission.enum";
import { PermissionService } from "@/permission/permission.service";
import { ProblemTypeService } from "@/problem-type/problem-type.service";
import { IProblemJudgeInfo } from "@/problem-type/problem-type.type";
import { LockService } from "@/redis/lock.service";
import { CE_LockType } from "@/redis/lock.type";
import { RedisService } from "@/redis/redis.service";
import { UserEntity } from "@/user/user.entity";

import { CE_ProblemEditResponseError, type ProblemEditPostRequestBodyDto } from "./dto/problem-edit.dto";
import { ProblemEditJudgePostRequestBodyDto } from "./dto/problem-edit-judge.dto";
import { ProblemEntity } from "./problem.entity";
import { E_ProblemFileType, E_ProblemType } from "./problem.type";
import { ProblemFileEntity } from "./problem-file.entity";
import { ProblemJudgeInfoEntity } from "./problem-judge-info.entity";

const REDIS_KEY_PROBLEM_PREPROCESSED_JUDGE_INFO = "problem-preprocessed-judge-info-and-submittable:{0}";

@Injectable()
export class ProblemService {
    constructor(
        @InjectDataSource()
        private readonly dataSource: DataSource,
        @InjectRepository(ProblemEntity)
        private readonly problemRepository: Repository<ProblemEntity>,
        @InjectRepository(ProblemJudgeInfoEntity)
        private readonly problemJudgeInfoRepository: Repository<ProblemJudgeInfoEntity>,
        @InjectRepository(ProblemFileEntity)
        private readonly problemFileRepository: Repository<ProblemFileEntity>,
        @Inject(forwardRef(() => ProblemTypeService))
        private readonly problemTypeService: ProblemTypeService,
        @Inject(forwardRef(() => PermissionService))
        private readonly permissionService: PermissionService,
        @Inject(forwardRef(() => LockService))
        private readonly lockService: LockService,
        @Inject(forwardRef(() => FileService))
        private readonly fileService: FileService,
        private readonly redisService: RedisService,
        private readonly configService: ConfigService,
    ) {}

    public async findProblemByIdAsync(id: number) {
        return await this.problemRepository.findOne({ where: { id } });
    }

    public async findProblemByDisplayIdAsync(displayId: number) {
        return await this.problemRepository.findOne({ where: { displayId } });
    }

    public async findProblemListAndCountAsync(
        page: number,
        sortBy: "displayId",
        order: CE_Order,
        keyword: string,
        user: UserEntity,
    ): Promise<{
        problems: ProblemEntity[];
        count: number;
    }> {
        const takeCount = this.configService.config.pagination.problem;

        const qb = this.problemRepository.createQueryBuilder("problem");

        if (this.permissionService.isSpecificUser(user.level)) {
            const specificProblemIds = await this.permissionService.findSpecificPermissionSourceIdsAsync(
                CE_SpecificPermission.Problem,
                user,
                user.level,
            );

            qb.where("problem.id IN (:...specificProblemIds)", { specificProblemIds });
        } else {
            qb.where("problem.visibility <= :level", { level: user.level });
        }

        if (keyword) {
            qb.andWhere((subQb) => {
                subQb.where("problem.title LIKE :keyword", { keyword: `%${keyword}%` });

                if (isInt(Number(keyword))) {
                    subQb.orWhere("problem.displayId = :displayId", { displayId: Number(keyword) });
                }
            });
        }

        qb.orderBy(`problem.${sortBy}`, order)
            .skip((page - 1) * takeCount)
            .take(takeCount);

        const [problems, count] = await qb.getManyAndCount();

        return { problems, count };
    }

    public async findProblemAdditionalFileByUUIDAsync(problem: ProblemEntity, uuid: string) {
        return await this.problemFileRepository.findOne({
            where: {
                problemId: problem.id,
                type: E_ProblemFileType.Additional,
                uuid,
            },
        });
    }

    public async findProblemAdditionalFilesAsync(problem: ProblemEntity) {
        return await this.problemFileRepository.find({
            where: { problemId: problem.id, type: E_ProblemFileType.Additional },
        });
    }

    public async countProblemAdditionalFilesAsync(problem: ProblemEntity) {
        return await this.problemFileRepository.count({
            where: { problemId: problem.id, type: E_ProblemFileType.Additional },
        });
    }

    public async countProblemTestdataFilesAsync(problem: ProblemEntity) {
        return await this.problemFileRepository.count({
            where: { problemId: problem.id, type: E_ProblemFileType.Testdata },
        });
    }

    public async findProblemTestdataFilesAsync(problem: ProblemEntity) {
        return await this.problemFileRepository.find({
            where: { problemId: problem.id, type: E_ProblemFileType.Testdata },
        });
    }

    public async updateProblemAsync(problem: ProblemEntity) {
        await this.problemRepository.save(problem);
    }

    public async updateJudgeInfoAsync(judgeInfo: ProblemJudgeInfoEntity) {
        await this.problemJudgeInfoRepository.save(judgeInfo);
    }

    public async deleteProblemAsync(problem: ProblemEntity) {
        let deleteFilesActually: (() => void) | undefined;
        await this.dataSource.transaction("READ COMMITTED", async (entityManager) => {
            const files = await entityManager.find(ProblemFileEntity, { where: { problemId: problem.id } });
            if (files.length > 0) {
                deleteFilesActually = await this.fileService.deleteFileAsync(
                    files.map((file) => file.uuid),
                    entityManager,
                );
            }
            await entityManager.remove(files);
            await entityManager.remove(problem);
        });
        deleteFilesActually?.();
    }

    public async deleteProblemFileAsync(problem: ProblemEntity, uuid: string) {
        let deleteFileActually: (() => void) | undefined;
        await this.dataSource.transaction("READ COMMITTED", async (entityManager) => {
            const file = await entityManager.findOne(ProblemFileEntity, {
                where: { problemId: problem.id, uuid },
            });
            if (!file) {
                throw new NoSuchProblemFileException();
            }
            deleteFileActually = await this.fileService.deleteFileAsync(file.uuid, entityManager);
            await entityManager.remove(file);
        });
        deleteFileActually?.();
    }

    public async generateNewDisplayIdAsync() {
        const problems = await this.problemRepository.find({
            order: {
                displayId: "DESC",
            },
            take: 1,
        });
        return problems.length > 0 ? problems[0].displayId + 1 : 1000;
    }

    public async editProblemAsync(
        problem: ProblemEntity,
        body: ProblemEditPostRequestBodyDto,
    ): Promise<CE_ProblemEditResponseError | null> {
        if (problem.displayId !== body.displayId) {
            if (await this.findProblemByDisplayIdAsync(body.displayId)) {
                return CE_ProblemEditResponseError.displayIdAlreadyExists;
            }
        }

        problem.displayId = body.displayId;
        problem.title = body.title;
        problem.description = body.description;
        problem.inputFormat = body.inputFormat;
        problem.outputFormat = body.outputFormat;
        problem.samples = body.samples;
        problem.limitAndHint = body.limitAndHint;

        if (problem.visibility === E_Visibility.Private && body.visibility !== E_Visibility.Private) {
            problem.publicTime = new Date();
        }
        problem.visibility = body.visibility;

        return null;
    }

    public async editProblemJudgeInfoAsync(
        judgeInfo: ProblemJudgeInfoEntity,
        body: ProblemEditJudgePostRequestBodyDto,
        problem: ProblemEntity,
        testdataFiles?: ProblemFileEntity[],
    ): Promise<string | null> {
        const hasSubmissions = false; // TODO: Check if the problem has submissions.

        if (body.type === E_ProblemType.SubmitAnswer) {
            if (hasSubmissions && judgeInfo.type !== E_ProblemType.SubmitAnswer) {
                throw new InvalidProblemTypeException();
            }
        } else {
            if (hasSubmissions && judgeInfo.type === E_ProblemType.SubmitAnswer) {
                throw new InvalidProblemTypeException();
            }
        }

        judgeInfo.type = body.type;

        const result = this.problemTypeService
            .get(body.type)
            .validateAndFilterJudgeInfo(
                body.info,
                testdataFiles || (await this.findProblemTestdataFilesAsync(problem)),
            );

        if (!result.success) {
            return result.message;
        }

        judgeInfo.info = body.info;

        return null;
    }

    public async checkIsAllowedViewAsync(problem: ProblemEntity, user: UserEntity) {
        // If the user has permission to edit the problem, they are allowed to view it.
        if (this.checkIsAllowedEdit(user)) {
            return true;
        }

        // If the user is a specific permission user,
        // and they don't have the specific permission to view the problem,
        // they are not allowed to view the problem.
        if (this.permissionService.isSpecificUser(user.level)) {
            return await this.permissionService.checkSpecificPermissionAsync(
                CE_SpecificPermission.Problem,
                user,
                problem.id,
            );
        }

        // If the user is a common permission user,
        // and they don't have the common permission to view the problem,
        // they are not allowed to view the problem.
        if (!this.permissionService.checkCommonPermission(CE_CommonPermission.AccessProblem, user.level)) {
            return false;
        }

        // If the user's level is lower than the problem's visibility level,
        // they are not allowed to view the problem.
        return this.permissionService.checkVisibility(problem.visibility, user.level);
    }

    public async checkIsAllowedSubmitAsync(problem: ProblemEntity, user: UserEntity) {
        // If the user is not allowed to view the problem,
        // they are not allowed to submit answers.
        if (!(await this.checkIsAllowedViewAsync(problem, user))) {
            return false;
        }

        // If specific permission users are allowed to view the problem,
        // they are allowed to submit answers.
        if (this.permissionService.isSpecificUser(user.level)) {
            return true;
        }

        // The common permission users are not allowed to submit answers by default,
        // unless they have the SubmitAnswer permission.
        return this.permissionService.checkCommonPermission(CE_CommonPermission.SubmitAnswer, user.level);
    }

    public checkIsAllowedEdit(user: UserEntity) {
        // Specific permission users are not allowed to edit problems.
        if (this.permissionService.isSpecificUser(user.level)) {
            return false;
        }

        // If the user is not allowed to manage problems,
        // they are not allowed to edit problems.
        return this.permissionService.checkCommonPermission(CE_CommonPermission.ManageProblem, user.level);
    }

    /**
     * Lock a problem by ID with Read/Write Lock.
     * @param type "read" to ensure the problem exists while holding the lock, "write" is for deleting the problem.
     */
    public async lockProblemByIdAsync<T>(
        id: number,
        type: CE_LockType,
        callbackAsync: (problem: ProblemEntity | null) => Promise<T>,
    ): Promise<T> {
        return await this.lockService.lockReadWriteAsync(
            `AcquireProblem_${id}`,
            type,
            async () => await callbackAsync(await this.findProblemByIdAsync(id)),
        );
    }

    public async lockManageFileByProblemIdAsync<T>(
        problemId: number,
        type: E_ProblemFileType,
        callbackAsync: (problem: ProblemEntity | null) => Promise<T>,
    ): Promise<T> {
        return await this.lockProblemByIdAsync(
            problemId,
            CE_LockType.Read,
            async (problem) =>
                await this.lockService.lockAsync(
                    `ManageProblemFile_${type}_${problemId}`,
                    async () => await callbackAsync(problem),
                ),
        );
    }

    /**
     * Should be called under lockManageFileByProblemIdAsync.
     */
    public async addProblemFileAsync(
        problem: ProblemEntity,
        type: E_ProblemFileType,
        filename: string,
        token: string,
    ): Promise<CE_FileUploadError | null> {
        let deleteOldFileActually: (() => void) | undefined;

        const result = await this.dataSource.transaction("REPEATABLE READ", async (entityManager) => {
            const result = await this.fileService.reportUploadFinishedAsync(token, entityManager);

            if (result.error) return result.error;

            const oldProblemFile = await entityManager.findOneBy(ProblemFileEntity, {
                problemId: problem.id,
                type,
                filename,
            });

            if (oldProblemFile) {
                deleteOldFileActually = await this.fileService.deleteFileAsync(oldProblemFile.uuid, entityManager);
                oldProblemFile.uuid = result.file.uuid;
                await entityManager.save(ProblemFileEntity, oldProblemFile);
            } else {
                const problemFile = new ProblemFileEntity();
                problemFile.problemId = problem.id;
                problemFile.type = type;
                problemFile.filename = filename;
                problemFile.uuid = result.file.uuid;
                await entityManager.save(ProblemFileEntity, problemFile);
            }

            return null;
        });

        deleteOldFileActually?.();

        return result;
    }

    /**
     * Judge info needs to be preprocessed before sending to clients or judge clients.
     * Currently preprocessing is detecting testcases from testdata files.
     *
     * The cache gets cleared when the testdata files or judge info changed.
     */
    public async getPreprocessedProblemJudgeInfoAsync(
        problem: ProblemEntity,
        problemJudgeInfo?: ProblemJudgeInfoEntity,
        testDataFiles?: ProblemFileEntity[],
    ): Promise<IProblemJudgeInfo> {
        const key = format(REDIS_KEY_PROBLEM_PREPROCESSED_JUDGE_INFO, problem.id);
        const cacheData = await this.redisService.cacheGetAsync(key);
        const cachedResult: IProblemJudgeInfo | null = cacheData && JSON.parse(cacheData);
        if (cachedResult) {
            return cachedResult;
        }

        const judgeInfoEntity = problemJudgeInfo || (await problem.judgeInfoPromise);
        const problemType = judgeInfoEntity ? judgeInfoEntity.type : E_ProblemType.Traditional;
        const judgeInfo = judgeInfoEntity
            ? judgeInfoEntity.info
            : this.problemTypeService.get(problemType).defaultJudgeInfo;

        const preprocessed = this.problemTypeService
            .get(problemType)
            .preprocessJudgeInfo(judgeInfo, testDataFiles || (await this.findProblemTestdataFilesAsync(problem)));
        await this.redisService.cacheSetAsync(key, JSON.stringify(preprocessed));

        return preprocessed;
    }
}
