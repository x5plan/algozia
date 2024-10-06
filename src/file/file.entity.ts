import { Column, Entity, Index, PrimaryGeneratedColumn } from "typeorm";

@Entity("file")
export class FileEntity {
    @PrimaryGeneratedColumn()
    public id: number;

    @Column({ type: "char", length: 36 })
    @Index({ unique: true })
    public uuid: string;

    @Column({ type: "integer" })
    public size: number;

    @Column({ type: "datetime" })
    public uploadTime: Date;
}
