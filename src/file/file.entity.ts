import { Column, Entity, Index, PrimaryGeneratedColumn } from "typeorm";

@Entity("file")
export class FileEntity {
    @PrimaryGeneratedColumn({ unsigned: true })
    public id: number;

    @Column({ name: "uuid", type: "char", length: 36, nullable: false })
    @Index({ unique: true })
    public uuid: string;

    @Column({ name: "size", type: "integer", nullable: false })
    public size: number;

    @Column({ name: "upload_time", type: "datetime", nullable: false })
    public uploadTime: Date;
}
