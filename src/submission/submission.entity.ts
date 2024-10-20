import { Column, Entity, Index, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from "typeorm";

import { E_CodeLanguage } from "@/code-language/code-language.type";
import { E_Visibility } from "@/permission/permission.enum";
import { ProblemEntity } from "@/problem/problem.entity";
import { UserEntity } from "@/user/user.entity";

import { E_SubmissionStatus } from "./submission.enum";
import { SubmissionDetailEntity } from "./submission-detail.entity";

@Entity("submission")
@Index(["visibility", "problemId", "submitterId", "status", "codeLanguage"])
@Index(["visibility", "problemId", "status", "codeLanguage"])
@Index(["visibility", "problemId", "codeLanguage", "submitterId"])
@Index(["visibility", "submitterId", "status", "codeLanguage"])
@Index(["visibility", "codeLanguage", "submitterId"])
@Index(["visibility", "status", "codeLanguage"])
@Index(["problemId", "submitterId"])
@Index(["submitterId", "status"])
@Index(["submitTime", "submitterId"])
export class SubmissionEntity {
    @PrimaryGeneratedColumn({ name: "id" })
    public readonly id: number;

    // An uuid to identify the judge task of the submission
    // (different for each rejudge, cleared on finish judging)
    @Column({ name: "task_id", type: "varchar", nullable: true, length: 36 })
    @Index()
    public taskId: string | null;

    // By default it equals to the problem or contest's visibility
    @Column({ name: "visibility", type: "integer", nullable: false })
    public visibility: E_Visibility;

    // Start: Fields for "some of the problem types" only
    @Column({ name: "code_lang", type: "enum", enum: E_CodeLanguage, nullable: true })
    @Index()
    public codeLanguage: E_CodeLanguage | null;

    @Column({ name: "answer_size", type: "integer", nullable: true })
    public answerSize: number | null;

    @Column({ name: "time_used", type: "integer", nullable: true })
    public timeUsed: number | null;

    @Column({ name: "memory_used", type: "integer", nullable: true })
    public memoryUsed: number | null;
    // End: Fields for "some of the problem types" only

    @Column({ name: "score", type: "integer", nullable: true })
    @Index()
    public score: number | null;

    @Column({ name: "status", type: "enum", enum: E_SubmissionStatus })
    @Index()
    public status: E_SubmissionStatus;

    // For backward compatibility it's nullable
    @Column({ name: "total_occupied_time", type: "integer", nullable: true })
    public totalOccupiedTime: number | null;

    @Column({ name: "submit_time", type: "datetime" })
    @Index()
    public submitTime: Date;

    @ManyToOne(() => ProblemEntity, { onDelete: "CASCADE" })
    @JoinColumn({ name: "problem_id" })
    public problemPromise: Promise<ProblemEntity>;

    @Column({ name: "problem_id" })
    @Index()
    public problemId: number;

    // TODO: Contest id, null if not in a contest

    @ManyToOne(() => UserEntity)
    @JoinColumn({ name: "submitter_id" })
    public submitterPromise: Promise<UserEntity>;

    @Column({ name: "submitter_id" })
    @Index()
    public submitterId: number;

    @OneToOne(() => SubmissionDetailEntity, (submissionDetail) => submissionDetail.submissionPromise)
    public detailPromise: Promise<SubmissionDetailEntity>;
}
