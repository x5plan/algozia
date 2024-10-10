import { Injectable } from "@nestjs/common";
import { plainToClass } from "class-transformer";
import { validateSync, ValidationError } from "class-validator";

import { E_CodeLanguage } from "./code-language.enum";
import {
    CompileAndRunOptionsC,
    CompileAndRunOptionsCpp,
    CompileAndRunOptionsCSharp,
    CompileAndRunOptionsFSharp,
    CompileAndRunOptionsGo,
    CompileAndRunOptionsHaskell,
    CompileAndRunOptionsJava,
    CompileAndRunOptionsKotlin,
    CompileAndRunOptionsPascal,
    CompileAndRunOptionsPython,
    CompileAndRunOptionsRust,
    CompileAndRunOptionsSwift,
} from "./compile-and-run-options";

const CompileAndRunOptionsClasses = {
    [E_CodeLanguage.Cpp]: CompileAndRunOptionsCpp,
    [E_CodeLanguage.C]: CompileAndRunOptionsC,
    [E_CodeLanguage.Java]: CompileAndRunOptionsJava,
    [E_CodeLanguage.Kotlin]: CompileAndRunOptionsKotlin,
    [E_CodeLanguage.Pascal]: CompileAndRunOptionsPascal,
    [E_CodeLanguage.Python]: CompileAndRunOptionsPython,
    [E_CodeLanguage.Rust]: CompileAndRunOptionsRust,
    [E_CodeLanguage.Swift]: CompileAndRunOptionsSwift,
    [E_CodeLanguage.Go]: CompileAndRunOptionsGo,
    [E_CodeLanguage.Haskell]: CompileAndRunOptionsHaskell,
    [E_CodeLanguage.CSharp]: CompileAndRunOptionsCSharp,
    [E_CodeLanguage.FSharp]: CompileAndRunOptionsFSharp,
};

@Injectable()
export class CodeLanguageService {
    public validateCompileAndRunOptions(language: E_CodeLanguage, compileAndRunOptions: unknown): ValidationError[] {
        return validateSync(plainToClass(CompileAndRunOptionsClasses[language], compileAndRunOptions), {
            whitelist: true,
            forbidNonWhitelisted: true,
        });
    }
}
