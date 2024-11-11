import { forwardRef, Inject, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { Repository } from "typeorm";

import { ConfigService } from "@/config/config.service";
import { UserService } from "@/user/user.service";

import { AuthEntity } from "./auth.entity";

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(AuthEntity)
        private readonly authRepository: Repository<AuthEntity>,
        @Inject(forwardRef(() => UserService))
        private readonly userService: UserService,
        @Inject(forwardRef(() => ConfigService))
        private readonly configService: ConfigService,
    ) {}

    public async changePasswordAsync(auth: AuthEntity, password: string): Promise<void> {
        auth.password = await this.hashPasswordAsync(password);
        await this.authRepository.save(auth);
    }

    private async hashPasswordAsync(password: string): Promise<string> {
        return await bcrypt.hash(password, 10);
    }

    private hashLegacyPassword(password: string): string {
        return crypto
            .createHash("md5")
            .update(password + "syzoj2_xxx")
            .digest("hex");
    }

    public async checkPasswordAsync(auth: AuthEntity, password: string): Promise<boolean> {
        return await bcrypt.compare(password, auth.password);
    }

    public async migratePasswordAsync(auth: AuthEntity, password: string) {
        const hashedPassword = this.hashLegacyPassword(password);

        if (auth.legacyPassword === hashedPassword) {
            auth.password = await this.hashPasswordAsync(password);
            auth.legacyPassword = null;
            await this.authRepository.save(auth);

            return true;
        }

        return false;
    }
}
