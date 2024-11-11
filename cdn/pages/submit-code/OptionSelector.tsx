import { useMemo, useState } from "preact/hooks";
import type React from "react";
import { Button, FormField } from "semantic-ui-react";

import { CodeLanguageAndOptions } from "<Shared>/CodeLanguageAndOptions";
import { getDefaultCompileAndRunOptions } from "<Shared>/CodeLanguageUtils";
import { E_CodeLanguage } from "<Shared>/Enums";

import styles from "./OptionSelector.module.less";

export interface IOptionSelectorProps {
    singleColumn: boolean;
}

export const OptionSelector: React.FC<IOptionSelectorProps> = (props) => {
    const { singleColumn } = props;

    const [language, setLanguage] = useState<E_CodeLanguage>(E_CodeLanguage.Cpp);
    const [options, setOptions] = useState<Record<string, unknown>>(getDefaultCompileAndRunOptions(E_CodeLanguage.Cpp));

    const innerElement = useMemo(
        () => (
            <CodeLanguageAndOptions
                language={language}
                compileAndRunOptions={options}
                onUpdateLanguage={(lang) => setLanguage(lang)}
                onUpdateCompileAndRunOptions={(opts) => setOptions(opts)}
            />
        ),
        [language, options],
    );

    return (
        <>
            {singleColumn ? (
                innerElement
            ) : (
                <div className={styles.compileAndRunOptions}>
                    {innerElement}
                    <FormField>
                        <Button fluid primary icon="paper plane" labelPosition="left" content="提交" />
                    </FormField>
                </div>
            )}
            <input name="language" style={{ display: "none" }} value={language} />
            <input name="compileAndRunOptions" style={{ display: "none" }} value={JSON.stringify(options)} />
        </>
    );
};
