import { Column, Entity, Index, JoinColumn, OneToOne, PrimaryColumn } from "typeorm";

import { SubmissionEntity } from "./submission.entity";
import { ISubmissionContent, ISubmissionProgress } from "./submission.type";

@Entity("submission_detail")
export class SubmissionDetailEntity {
    @OneToOne(() => SubmissionEntity, { onDelete: "CASCADE" })
    @JoinColumn({ name: "submission_id" })
    public submissionPromise: Promise<SubmissionEntity>;

    @PrimaryColumn({ name: "submission_id" })
    public submissionId: number;

    @Column({ name: "content", type: "json" })
    public content: ISubmissionContent;

    @Column({ name: "file_uuid", type: "char", length: 36, nullable: true })
    @Index({ unique: true })
    public fileUuid: string;

    @Column({ name: "result", type: "json", nullable: true })
    public result: ISubmissionProgress;
}
