import { IsIn } from "class-validator";

export class CompileAndRunOptionsCpp {
    @IsIn(["g++", "clang++"])
    public compiler: string;

    @IsIn(["c++03", "c++11", "c++14", "c++17", "c++20", "gnu++03", "gnu++11", "gnu++14", "gnu++17", "gnu++20"])
    public std: string;

    @IsIn(["0", "1", "2", "3", "fast"])
    public O: string;

    @IsIn(["64", "32", "x32"])
    public m: string;
}
