import path from "node:path";
import { fileURLToPath } from "node:url";

import { FlatCompat } from "@eslint/eslintrc";
import js from "@eslint/js";
import typescriptEslintEslintPlugin from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import globals from "globals";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all,
});

export default [
    ...compat.extends("plugin:@typescript-eslint/recommended", "plugin:prettier/recommended"),
    {
        plugins: {
            "@typescript-eslint": typescriptEslintEslintPlugin,
            "simple-import-sort": simpleImportSort,
        },

        languageOptions: {
            globals: {
                ...globals.node,
            },

            parser: tsParser,
            ecmaVersion: 5,
            sourceType: "module",

            parserOptions: {
                project: "tsconfig.json",
                tsconfigRootDir: __dirname,
            },
        },

        rules: {
            "arrow-parens": ["error", "always"],
            curly: ["error", "multi-line"],
            "import/no-cycle": "off",
            "no-extend-native": "error",
            "no-unused-vars": "off",

            "@typescript-eslint/explicit-member-accessibility": [
                "error",
                {
                    accessibility: "explicit",

                    overrides: {
                        constructors: "no-public",
                    },
                },
            ],
            "simple-import-sort/exports": "error",
            "simple-import-sort/imports": "error",
            "@typescript-eslint/consistent-type-imports": "error",
            "@typescript-eslint/explicit-function-return-type": "off",
            "@typescript-eslint/explicit-module-boundary-types": "off",
            "@typescript-eslint/naming-convention": [
                "error",
                {
                    selector: "interface",
                    format: ["PascalCase"],
                    prefix: ["I"],
                },
                {
                    selector: "enum",
                    format: ["PascalCase"],
                    prefix: ["CE_", "E_"],
                },
                {
                    selector: ["function", "classMethod"],
                    modifiers: ["async"],
                    format: ["camelCase", "PascalCase"],
                    suffix: ["Async"],
                },
            ],
            "@typescript-eslint/no-empty-interface": "off",
            "@typescript-eslint/no-explicit-any": "error",
            "@typescript-eslint/no-duplicate-enum-values": "error",
            "@typescript-eslint/no-unused-vars": [
                "error",
                {
                    vars: "local",
                    args: "after-used",
                },
            ],
            "@typescript-eslint/prefer-as-const": "error",
        },
    },
];
