import { Column, Entity, Index, PrimaryGeneratedColumn } from "typeorm";

@Entity("judge_client")
export class JudgeClientEntity {
    @PrimaryGeneratedColumn()
    public readonly id: number;

    @Column({ name: "name", type: "varchar", length: 80, nullable: false })
    public name: string;

    @Column({ name: "key", type: "char", length: 40, nullable: false })
    @Index({ unique: true })
    public key: string;

    @Column({ name: "allowed_hosts", type: "json", nullable: false })
    public allowedHosts: string[];

    @Column({ name: "use_public_file_url", type: "boolean", nullable: false, default: true })
    public usePublicFileUrl: boolean;
}
