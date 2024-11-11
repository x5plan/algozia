import typescriptEslintEslintPlugin from "@typescript-eslint/eslint-plugin";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import reactHooks from "eslint-plugin-react-hooks";
import { fixupPluginRules } from "@eslint/compat";
import globals from "globals";
import tsParser from "@typescript-eslint/parser";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all,
});

export default [
    {
        ignores: [
            "assets/**",
            "build/**",
            "build-tools/**",
            "configs/**",
            "dist/**",
            "examples/**",
            "fonts/**",
            "scripts/**",
            "*.config.mjs",
            "*.config.mts",
        ],
    },
    ...compat.extends(
        "plugin:@typescript-eslint/recommended",
        "plugin:prettier/recommended",
        "plugin:react/recommended",
    ),
    {
        plugins: {
            "@typescript-eslint": typescriptEslintEslintPlugin,
            "simple-import-sort": simpleImportSort,
            "react-hooks": fixupPluginRules(reactHooks),
        },

        languageOptions: {
            globals: {
                ...globals.browser,
            },

            parser: tsParser,
            ecmaVersion: 12,
            sourceType: "script",

            parserOptions: {
                ecmaFeatures: {
                    jsx: true,
                },

                project: "tsconfig.pages.json",

                tsconfigRootDir: __dirname,
            },
        },

        rules: {
            "arrow-parens": ["error", "always"],
            curly: ["error", "multi-line"],
            "import/no-cycle": "off",
            "no-extend-native": "error",
            "no-unused-vars": "off",
            "react/jsx-uses-react": "error",
            "react/jsx-uses-vars": "error",
            "react-hooks/rules-of-hooks": "error",
            "react-hooks/exhaustive-deps": "error",
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
            "@typescript-eslint/no-explicit-any": "off",
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
