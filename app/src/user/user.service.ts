import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { UserEntity } from "./user.entity";

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(UserEntity)
        private readonly userRepository: Repository<UserEntity>,
    ) {}

    public async findUserByIdAsync(id: number) {
        return await this.userRepository.findOne({ where: { id } });
    }

    public async findUserByUsernameAsync(username: string) {
        return await this.userRepository.findOne({ where: { username } });
    }
}
