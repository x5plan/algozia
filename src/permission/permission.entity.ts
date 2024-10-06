import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from "typeorm";

import { UserEntity } from "@/user/user.entity";

@Entity("permission")
export class PermissionEntity {
    @OneToOne(() => UserEntity, {
        onDelete: "CASCADE",
    })
    @JoinColumn({ name: "user_id" })
    public userPromise: Promise<UserEntity>;

    @PrimaryColumn({ name: "user_id" })
    public userId: number;

    @Column({ name: "allowed_problem_ids", type: "simple-array", nullable: false })
    public allowedProblemIds: number[];

    @Column({ name: "allowed_contest_ids", type: "simple-array", nullable: false })
    public allowedContestIds: number[];
}
