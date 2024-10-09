import { IsIn } from "class-validator";

export class CompileAndRunOptionsKotlin {
    @IsIn(["1.5", "1.6", "1.7", "1.8", "1.9"])
    public version: string;

    @IsIn(["jvm"])
    public platform: string;
}
