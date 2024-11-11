import { IsIn } from "class-validator";

export class CompileAndRunOptionsHaskell {
    @IsIn(["98", "2010"])
    public version: string;
}
