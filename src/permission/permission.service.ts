import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { CE_Permission, CE_SpecificPermission } from "@/common/permission/permissions";
import { CE_UserLevel } from "@/common/permission/user-level";
import { UserEntity } from "@/user/user.entity";

import { PermissionEntity } from "./permission.entity";

@Injectable()
export class PermissionService {
    constructor(
        @InjectRepository(PermissionEntity)
        private readonly permissionRepository: Repository<PermissionEntity>,
    ) {}

    public async findPermissionAsync(user: UserEntity) {
        return await this.permissionRepository.findOne({ where: { userId: user.id } });
    }

    public async findSpecificPermissionSourceIdsAsync(
        specificPermission: CE_SpecificPermission,
        user: UserEntity,
    ): Promise<number[]> {
        const permission = await this.findPermissionAsync(user);
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
        sourceId: number,
    ) {
        if (!this.isSpecificUser(user)) {
            return true;
        }

        const sourceIds = await this.findSpecificPermissionSourceIdsAsync(specificPermission, user);
        return sourceIds.includes(sourceId);
    }

    public checkCommonPermission(permission: CE_Permission, user: UserEntity, specificAllowed = false) {
        if (specificAllowed && this.isSpecificUser(user)) {
            return true;
        }

        return user.level >= permission;
    }

    public isSpecificUser(user: UserEntity) {
        return user.level === CE_UserLevel.Specific;
    }
}
