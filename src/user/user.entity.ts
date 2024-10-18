import { Column, Entity, Index, OneToOne, PrimaryGeneratedColumn } from "typeorm";

import { AuthEntity } from "@/auth/auth.entity";
import { CE_UserLevel } from "@/permission/permission.enum";

@Entity("user")
export class UserEntity {
    @PrimaryGeneratedColumn()
    public readonly id: number;

    @Column({ name: "username", type: "varchar", length: 24, nullable: false })
    @Index({ unique: true })
    public username: string;

    @Column({ name: "email", type: "varchar", length: 255, nullable: false })
    @Index({ unique: true })
    public email: string;

    @Column({ name: "nickname", type: "varchar", length: 24, nullable: true })
    public nickname: string | null;

    @Column({ name: "bio", type: "text", nullable: true })
    public bio: string | null;

    @Column({ name: "level", type: "integer" })
    public level: CE_UserLevel;

    @Column({ name: "registration_time", type: "datetime", nullable: true })
    public registrationTime: Date | null;

    @OneToOne(() => AuthEntity, (auth) => auth.userPromise)
    public authPromise: Promise<AuthEntity>;
}
