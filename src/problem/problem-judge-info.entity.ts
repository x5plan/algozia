import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from "typeorm";

import { ToEntity } from "@/common/types/to-entity";

import { ProblemEntity } from "./problem.entity";
import { E_ProblemType, IProblemJudgeInfo, IProblemJudgeInfoEditable } from "./problem.type";

@Entity("problem_judge_info")
export class ProblemJudgeInfoEntity implements ToEntity<IProblemJudgeInfoEditable> {
    @OneToOne(() => ProblemEntity, (problem) => problem.judgeInfoPromise, { onDelete: "CASCADE" })
    @JoinColumn({ name: "problem_id" })
    public problemPromise: Promise<ProblemEntity>;

    @PrimaryColumn({ name: "problem_id" })
    public problemId: number;

    @Column({ name: "type", type: "enum", enum: E_ProblemType })
    public type: E_ProblemType;

    @Column({ type: "json" })
    public judgeInfo: IProblemJudgeInfo;
}
