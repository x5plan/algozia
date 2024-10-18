import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { UserEntity } from "@/user/user.entity";

import { PermissionEntity } from "./permission.entity";
import { CE_CommonPermission, CE_SpecificPermission, E_Visibility } from "./permission.enum";
import { CE_UserLevel } from "./permission.enum";
import { IGlobalViewPermissions } from "./permission.type";

type CommonUserLevel = Exclude<CE_UserLevel, CE_UserLevel.Specific>;

@Injectable()
export class PermissionService {
    constructor(
        @InjectRepository(PermissionEntity)
        private readonly permissionRepository: Repository<PermissionEntity>,
    ) {}

    public async findPermissionAsync(
        user: UserEntity,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        userLevel: CE_UserLevel.Specific, // Just for type checking if the userLevel is specific
    ): Promise<PermissionEntity | null> {
        return await this.permissionRepository.findOne({ where: { userId: user.id } });
    }

    public async findSpecificPermissionSourceIdsAsync(
        specificPermission: CE_SpecificPermission,
        user: UserEntity,
        userLevel: CE_UserLevel.Specific, // Just for type checking if the userLevel is specific
    ): Promise<number[]> {
        const permission = await this.findPermissionAsync(user, userLevel);
        if (!permission) {
            return [];
        }
        switch (specificPermission) {
            case CE_SpecificPermission.Problem:
                return permission.allowedProblemIds;
            case CE_SpecificPermission.Contest:
                return permission.allowedContestIds;
            default:
                return [];
        }
    }

    public async checkSpecificPermissionAsync(
        specificPermission: CE_SpecificPermission,
        user: UserEntity,
        userLevel: CE_UserLevel.Specific, // Just for type checking if the userLevel is specific
        sourceId?: number,
    ) {
        const sourceIds = await this.findSpecificPermissionSourceIdsAsync(specificPermission, user, userLevel);
        return sourceId ? sourceIds.includes(sourceId) : sourceIds.length > 0;
    }

    public checkCommonPermission(permission: CE_CommonPermission, userLevel: CommonUserLevel) {
        return userLevel >= permission;
    }

    public checkVisibility(visibility: E_Visibility, userLevel: CommonUserLevel) {
        return userLevel >= visibility;
    }

    public isSpecificUser(userLevel: CE_UserLevel): userLevel is CE_UserLevel.Specific {
        return userLevel === CE_UserLevel.Specific;
    }

    public async getGlobalViewPermissionsAsync(user: UserEntity | null): Promise<IGlobalViewPermissions> {
        if (!user) {
            return {
                showProblem: false,
                showContest: false,
                showHomework: false,
                showSubmission: false,
            };
        }

        if (this.isSpecificUser(user.level)) {
            const problemPermission = await this.checkSpecificPermissionAsync(
                CE_SpecificPermission.Problem,
                user,
                user.level,
            );
            const contestPermission = await this.checkSpecificPermissionAsync(
                CE_SpecificPermission.Contest,
                user,
                user.level,
            );

            return {
                showProblem: problemPermission,
                showContest: contestPermission,
                showHomework: false,
                showSubmission: problemPermission,
            };
        }

        return {
            showProblem: this.checkCommonPermission(CE_CommonPermission.AccessProblem, user.level),
            showContest: this.checkCommonPermission(CE_CommonPermission.AccessContest, user.level),
            showHomework: this.checkCommonPermission(CE_CommonPermission.AccessHomework, user.level),
            showSubmission: this.checkCommonPermission(CE_CommonPermission.SubmitAnswer, user.level),
        };
    }
}
