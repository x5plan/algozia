import { Column, Entity, Index, PrimaryGeneratedColumn } from "typeorm";

@Entity("judge_client")
export class JudgeClientEntity {
    @PrimaryGeneratedColumn()
    public readonly id: number;

    @Column({ type: "varchar", length: 80 })
    public name: string;

    @Column({ type: "char", length: 40 })
    @Index({ unique: true })
    public key: string;

    @Column({ type: "json" })
    public allowedHosts: string[];
}
