import type React from "react";
import { useMemo } from "react";
import type { DropdownItemProps, DropdownProps, FormSelectProps, SemanticICONS } from "semantic-ui-react";
import { Dropdown, Form, Icon, Popup } from "semantic-ui-react";

import style from "./TestDataFileSelector.module.less";
import { getFileIcon } from "./TestDataFileSelector.util";

export interface ITestDataFileSelectorProps {
    type: "FormSelect" | "ItemSearchDropdown";
    className?: string;
    iconInputOrOutput?: SemanticICONS;
    label?: FormSelectProps["label"];
    testData: string[];
    optional?: boolean;
    value: string;
    placeholder: string;
    onChange: (value: string) => void;
}

export const TestDataFileSelector: React.FC<ITestDataFileSelectorProps> = (props) => {
    const { type, className, iconInputOrOutput, label, testData, optional, value, placeholder, onChange } = props;

    const dropdownItems = useMemo<DropdownItemProps[]>(
        () => [
            ...(optional
                ? [
                      {
                          key: null,
                          value: null,
                          text: (
                              <>
                                  {iconInputOrOutput && (
                                      <Icon
                                          className={style.iconInputOrOutput + " " + style.invisible}
                                          name={iconInputOrOutput}
                                      />
                                  )}
                                  <Icon name="file code outline" className={style.iconFile + " " + style.invisible} />
                                  <div className={style.filename}>空</div>
                              </>
                          ),
                      },
                  ]
                : []),
            ...testData.map((file) => ({
                key: file,
                value: file,
                text: (
                    <>
                        {iconInputOrOutput && <Icon className={style.iconInputOrOutput} name={iconInputOrOutput} />}
                        <Icon name={getFileIcon(file)} className={style.iconFile} />
                        <div className={style.filename}>{file}</div>
                    </>
                ),
            })),
        ],
        [iconInputOrOutput, optional, testData],
    );

    const uiProps = useMemo<FormSelectProps | DropdownProps>(
        () => ({
            className:
                style.fileSelect +
                " " +
                (type === "ItemSearchDropdown" ? style.itemSearchDropdown : style.formSelect) +
                (className ? " " + className : ""),
            label,
            text:
                value && !testData.some((file) => file === value)
                    ? ((
                          <>
                              {iconInputOrOutput && (
                                  <Icon className={style.iconInputOrOutput} name={iconInputOrOutput} />
                              )}
                              <Popup
                                  trigger={<Icon name="warning sign" className={style.iconFile} />}
                                  content="数据包中找不到该文件。"
                                  position="top center"
                              />
                              <span>{value}</span>
                          </>
                      ) as any)
                    : undefined,
            placeholder,
            value,
            options: dropdownItems,
            onChange: (e, { value }) => onChange(value as string),
        }),
        [className, dropdownItems, iconInputOrOutput, label, onChange, placeholder, testData, type, value],
    );

    return type === "ItemSearchDropdown" ? (
        <Dropdown item selection search noResultsMessage={"找不到匹配的文件。"} {...uiProps} />
    ) : (
        <Form.Select open={testData.length === 0 ? false : undefined} {...(uiProps as FormSelectProps)} />
    );
};
