import { IsIn } from "class-validator";

export class CompileAndRunOptionsRust {
    @IsIn(["2015", "2018", "2021"])
    public version: string;

    @IsIn(["0", "1", "2", "3"])
    public optimize: string;
}
