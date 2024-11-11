import React, { useCallback, useRef } from "react";
import { Form } from "semantic-ui-react";

import { CodeLanguageString } from "./CodeLanguageString";
import {
    compileAndRunOptions as sharedCompileAndRunOptions,
    getDefaultCompileAndRunOptions,
} from "./CodeLanguageUtils";
import type { E_CodeLanguage } from "./Enums";

interface ICodeLanguageAndOptionsProps {
    language: E_CodeLanguage;
    compileAndRunOptions: Record<string, unknown>;
    onUpdateLanguage: (newLanguage: E_CodeLanguage) => void;
    onUpdateCompileAndRunOptions: (newCompileAndRunOptions: Record<string, unknown>) => void;
}

export const CodeLanguageAndOptions: React.FC<ICodeLanguageAndOptionsProps> = (props) => {
    const { language, compileAndRunOptions, onUpdateLanguage, onUpdateCompileAndRunOptions } = props;

    const compileAndRunOptionsBackup = useRef(new Map<E_CodeLanguage, Record<string, unknown>>());

    const onSwitchLanguage = useCallback(
        (newLanguage: E_CodeLanguage) => {
            const oldLanguage = language;
            compileAndRunOptionsBackup.current.set(oldLanguage, compileAndRunOptions);
            onUpdateLanguage(newLanguage);
            onUpdateCompileAndRunOptions(
                compileAndRunOptionsBackup.current.get(newLanguage) || getDefaultCompileAndRunOptions(newLanguage),
            );
        },
        [compileAndRunOptions, language, onUpdateCompileAndRunOptions, onUpdateLanguage],
    );

    return (
        <>
            <Form.Select
                label={CodeLanguageString.code_language}
                value={language}
                options={(Object.keys(sharedCompileAndRunOptions) as E_CodeLanguage[]).map((lang) => ({
                    key: lang,
                    value: lang,
                    text: CodeLanguageString[lang].name,
                }))}
                onChange={(e, { value }) => onSwitchLanguage(value as E_CodeLanguage)}
            />
            {sharedCompileAndRunOptions[language as E_CodeLanguage].map((option) => (
                <Form.Select
                    key={option.name}
                    label={CodeLanguageString[language].options[option.name].name}
                    value={compileAndRunOptions[option.name] as string}
                    options={option.values.map((value) => ({
                        key: value,
                        value: value,
                        text: CodeLanguageString[language]?.options?.[option.name]?.values?.[value],
                    }))}
                    onChange={(e, { value }) =>
                        onUpdateCompileAndRunOptions({
                            ...compileAndRunOptions,
                            [option.name]: value,
                        })
                    }
                />
            ))}
        </>
    );
};
