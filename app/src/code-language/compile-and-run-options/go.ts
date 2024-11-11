import { IsIn } from "class-validator";

export class CompileAndRunOptionsGo {
    @IsIn(["1.x"])
    public version: string;
}
