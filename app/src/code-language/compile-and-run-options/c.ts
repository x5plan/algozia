import { IsIn } from "class-validator";

export class CompileAndRunOptionsC {
    @IsIn(["gcc", "clang"])
    public compiler: string;

    @IsIn(["c89", "c99", "c11", "c17", "gnu89", "gnu99", "gnu11", "gnu17"])
    public std: string;

    @IsIn(["0", "1", "2", "3", "fast"])
    public O: string;

    @IsIn(["64", "32", "x32"])
    public m: string;
}
