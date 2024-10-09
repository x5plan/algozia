import { IsIn } from "class-validator";

export class CompileAndRunOptionsSwift {
    @IsIn(["4.2", "5", "6"])
    public version: string;

    @IsIn(["Onone", "O", "Ounchecked"])
    public optimize: string;
}
