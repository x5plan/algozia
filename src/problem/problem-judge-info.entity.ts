import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from "typeorm";

import { ToEntity } from "@/common/types/to-entity";

import { ProblemEntity } from "./problem.entity";
import { E_ProblemType, IProblemJudgeInfoEditable } from "./problem.type";

@Entity("problem_judge_info")
export class ProblemJudgeInfoEntity implements ToEntity<IProblemJudgeInfoEditable> {
    @OneToOne(() => ProblemEntity, (problem) => problem.judgeInfoPromise, { onDelete: "CASCADE" })
    @JoinColumn({ name: "problem_id" })
    public problemPromise: Promise<ProblemEntity>;

    @PrimaryColumn({ name: "problem_id" })
    public problemId: number;

    @Column({ name: "type", type: "enum", enum: E_ProblemType })
    public type: E_ProblemType;

    @Column({ name: "time_limit", type: "integer" })
    public timeLimit: number;

    @Column({ name: "memory_limit", type: "integer" })
    public memoryLimit: number;

    @Column({ name: "file_io", type: "boolean", nullable: true })
    public fileIO: boolean | null;

    @Column({ name: "input_file_name", type: "text", nullable: true })
    public inputFileName: string | null;

    @Column({ name: "output_file_name", type: "text", nullable: true })
    public outputFileName: string | null;

    @Column({ name: "testdata_config", type: "simple-json", nullable: true })
    public testdataConfig: unknown | null;
}
