import { Column, Entity, Index, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from "typeorm";

import { UserEntity } from "@/user/user.entity";

import { CE_ProblemVisibility, IProblemEditable } from "./problem.type";
import { ProblemJudgeInfoEntity } from "./problem-judge-info.entity";

@Entity("problem")
@Index(["displayId", "visibility"])
export class ProblemEntity implements IProblemEditable {
    @PrimaryGeneratedColumn()
    public readonly id: number;

    @Column({ name: "display_id", type: "integer", nullable: false })
    @Index({ unique: true })
    public displayId: number;

    @Column({ name: "title", type: "varchar", length: 80, nullable: false, default: "" })
    public title: string;

    @Column({ name: "description", type: "text", nullable: false, default: "" })
    public description: string;

    @Column({ name: "input_format", type: "text", nullable: false, default: "" })
    public inputFormat: string;

    @Column({ name: "output_format", type: "text", nullable: false, default: "" })
    public outputFormat: string;

    @Column({ name: "samples", type: "text", nullable: false, default: "" })
    public samples: string;

    @Column({ name: "limit_and_hint", type: "text", nullable: false, default: "" })
    public limitAndHint: string;

    @Column({ name: "visibility", type: "integer", nullable: false, default: CE_ProblemVisibility.Private })
    public visibility: CE_ProblemVisibility;

    @Column({ name: "upload_time", type: "datetime", nullable: false })
    public uploadTime: Date;

    @Column({ name: "public_time", type: "datetime", nullable: true })
    public publicTime: Date | null;

    @ManyToOne(() => UserEntity)
    @JoinColumn({ name: "uploader_id" })
    public uploaderPromise: Promise<UserEntity | null>;

    @Column({ name: "uploader_id", nullable: true })
    public uploaderId: number | null;

    @OneToOne(() => ProblemJudgeInfoEntity, (judgeInfo) => judgeInfo.problemPromise)
    public judgeInfoPromise: Promise<ProblemJudgeInfoEntity | null>;
}
