import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from "typeorm";

import { UserEntity } from "@/user/user.entity";

@Entity("auth")
export class AuthEntity {
    @OneToOne(() => UserEntity, (user) => user.authPromise)
    @JoinColumn({ name: "user_id" })
    public userPromise: Promise<UserEntity>;

    @PrimaryColumn({ name: "user_id" })
    public userId: number;

    @Column({ name: "password", type: "char", length: 60 })
    public password: string;

    @Column({ name: "legacy_password", type: "char", length: 60, nullable: true })
    public legacyPassword: string | null;
}
