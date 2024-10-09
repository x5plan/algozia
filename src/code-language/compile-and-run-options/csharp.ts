import { IsIn } from "class-validator";

export class CompileAndRunOptionsCSharp {
    @IsIn(["7.3", "8", "9"])
    public version: string;
}
