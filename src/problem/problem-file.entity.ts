import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

import { ProblemEntity } from "./problem.entity";
import { E_ProblemFileType } from "./problem.type";

@Entity("problem_file")
@Index(["problemId", "type"])
@Index(["problemId", "uuid", "type"], { unique: true })
@Index(["problemId", "filename", "type"], { unique: true })
export class ProblemFileEntity {
    @PrimaryGeneratedColumn()
    public id: number;

    @ManyToOne(() => ProblemEntity, {
        // You should delete the file manually from MinIO before deleting the problem.
        onDelete: "RESTRICT",
    })
    @JoinColumn({ name: "problem_id" })
    public problemPromise: Promise<ProblemEntity>;

    @Column({ name: "problem_id" })
    public problemId: number;

    @Column({ type: "char", length: 36 })
    public uuid: string;

    @Column({ name: "filename", type: "varchar", length: 256, nullable: false })
    public filename: string;

    @Column({ name: "type", type: "enum", enum: E_ProblemFileType, nullable: false })
    public type: E_ProblemFileType;
}
