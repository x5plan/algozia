import { E_CodeLanguage } from "./Enums";

const codeLanguageExtensions: Record<E_CodeLanguage, string[]> = {
    [E_CodeLanguage.Cpp]: [".cpp", ".cc", ".cxx"],
    [E_CodeLanguage.C]: [".c"],
    [E_CodeLanguage.Java]: [".java"],
    [E_CodeLanguage.Kotlin]: [".kt"],
    [E_CodeLanguage.Pascal]: [".pas"],
    [E_CodeLanguage.Python]: [".py"],
    [E_CodeLanguage.Rust]: [".rs"],
    [E_CodeLanguage.Swift]: [".swift"],
    [E_CodeLanguage.Go]: [".go"],
    [E_CodeLanguage.Haskell]: [".hs"],
    [E_CodeLanguage.CSharp]: [".cs"],
    [E_CodeLanguage.FSharp]: [".fs"],
};

export function checkCodeFileExtension(language: E_CodeLanguage, filename: string): boolean {
    return codeLanguageExtensions[language].some((extension) => filename.toLowerCase().endsWith(extension));
}

export interface ICodeLanguageOption {
    name: string;
    values: string[]; // string[] | undefined
    defaultValue: string; // string | boolean
}

export const compileAndRunOptions: Record<E_CodeLanguage, ICodeLanguageOption[]> = {
    [E_CodeLanguage.Cpp]: [
        {
            name: "compiler",
            values: ["g++", "clang++"],
            defaultValue: "g++",
        },
        {
            name: "std",
            values: [
                "c++03",
                "c++11",
                "c++14",
                "c++17",
                "c++20",
                "gnu++03",
                "gnu++11",
                "gnu++14",
                "gnu++17",
                "gnu++20",
            ],
            defaultValue: "c++11",
        },
        {
            name: "O",
            values: ["0", "1", "2", "3", "fast"],
            defaultValue: "2",
        },
        {
            name: "m",
            values: ["64", "32", "x32"],
            defaultValue: "64",
        },
    ],
    [E_CodeLanguage.C]: [
        {
            name: "compiler",
            values: ["gcc", "clang"],
            defaultValue: "gcc",
        },
        {
            name: "std",
            values: ["c89", "c99", "c11", "c17", "gnu89", "gnu99", "gnu11", "gnu17"],
            defaultValue: "c11",
        },
        {
            name: "O",
            values: ["0", "1", "2", "3", "fast"],
            defaultValue: "2",
        },
        {
            name: "m",
            values: ["64", "32", "x32"],
            defaultValue: "64",
        },
    ],
    [E_CodeLanguage.Java]: [],
    [E_CodeLanguage.Kotlin]: [
        {
            name: "version",
            values: ["1.5", "1.6", "1.7", "1.8", "1.9"],
            defaultValue: "1.8",
        },
        {
            name: "platform",
            values: ["jvm"],
            defaultValue: "jvm",
        },
    ],
    [E_CodeLanguage.Pascal]: [
        {
            name: "optimize",
            values: ["-", "1", "2", "3", "4"],
            defaultValue: "2",
        },
    ],
    [E_CodeLanguage.Python]: [
        {
            name: "version",
            values: ["2.7", "3.9", "3.10"],
            defaultValue: "3.10",
        },
    ],
    [E_CodeLanguage.Rust]: [
        {
            name: "version",
            values: ["2015", "2018", "2021"],
            defaultValue: "2021",
        },
        {
            name: "optimize",
            values: ["0", "1", "2", "3"],
            defaultValue: "3",
        },
    ],
    [E_CodeLanguage.Swift]: [
        {
            name: "version",
            values: ["4.2", "5", "6"],
            defaultValue: "5",
        },
        {
            name: "optimize",
            values: ["Onone", "O", "Ounchecked"],
            defaultValue: "O",
        },
    ],
    [E_CodeLanguage.Go]: [
        {
            name: "version",
            values: ["1.x"],
            defaultValue: "1.x",
        },
    ],
    [E_CodeLanguage.Haskell]: [
        {
            name: "version",
            values: ["98", "2010"],
            defaultValue: "2010",
        },
    ],
    [E_CodeLanguage.CSharp]: [
        {
            name: "version",
            values: ["7.3", "8", "9"],
            defaultValue: "9",
        },
    ],
    [E_CodeLanguage.FSharp]: [],
};

export const getDefaultCompileAndRunOptions = (E_CodeLanguage: E_CodeLanguage): Record<string, unknown> =>
    Object.fromEntries(compileAndRunOptions[E_CodeLanguage].map(({ name, defaultValue }) => [name, defaultValue]));

export const filterValidCompileAndRunOptions = (
    E_CodeLanguage: E_CodeLanguage,
    inputOptions: Record<string, unknown>,
): Record<string, unknown> =>
    Object.assign(
        {},
        getDefaultCompileAndRunOptions(E_CodeLanguage),
        Object.fromEntries(
            Object.entries(inputOptions || ({} as Record<string, unknown>)).filter(([name, value]) => {
                const option = compileAndRunOptions[E_CodeLanguage].find((option) => option.name === name);
                if (!option) return false;
                return option.values.includes(value as string);
            }),
        ),
    );
