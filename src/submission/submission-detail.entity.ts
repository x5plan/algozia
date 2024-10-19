import { Column, Entity, Index, JoinColumn, OneToOne, PrimaryColumn } from "typeorm";

import { SubmissionEntity } from "./submission.entity";
import { ISubmissionProgress } from "./submission.type";

@Entity("submission_detail")
export class SubmissionDetailEntity {
    @OneToOne(() => SubmissionEntity, { onDelete: "CASCADE" })
    @JoinColumn({ name: "submission_id" })
    public submissionPromise: Promise<SubmissionEntity>;

    @PrimaryColumn({ name: "submission_id" })
    public submissionId: number;

    // Start: Fields for "some of the problem types" only
    @Column({ name: "compile_and_run_options", type: "json", nullable: true })
    public compileAndRunOptions: unknown | null;

    @Column({ name: "code", type: "text", nullable: true })
    public code: string | null;

    @Column({ name: "file_uuid", type: "char", length: 36, nullable: true })
    @Index({ unique: true })
    public fileUuid: string | null;
    // End: Fields for "some of the problem types" only

    @Column({ name: "result", type: "json", nullable: true })
    public result: ISubmissionProgress;
}
