import { IsIn } from "class-validator";

export class CompileAndRunOptionsPascal {
    @IsIn(["-", "1", "2", "3", "4"])
    public optimize: string;
}
