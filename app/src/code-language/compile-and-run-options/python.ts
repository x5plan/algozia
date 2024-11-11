import { IsIn } from "class-validator";

export class CompileAndRunOptionsPython {
    @IsIn(["2.7", "3.9", "3.10"])
    public version: string;
}
