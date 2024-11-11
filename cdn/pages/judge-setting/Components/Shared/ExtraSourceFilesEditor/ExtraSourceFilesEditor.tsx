import update from "immutability-helper";
import { useCallback, useState } from "preact/compat";
import type React from "react";
import { Button, Dropdown, Form, Input, Menu, Popup } from "semantic-ui-react";
import { v4 as uuid } from "uuid";

import { CodeLanguageString } from "../../../../shared/CodeLanguageString";
import { E_CodeLanguage } from "../../../../shared/Enums";
import { TestDataFileSelector } from "../TestDataFileSelector";
import type { IEditorComponentProps } from "../Type";
import style from "./ExtraSourceFilesEditor.module.less";
import type { IJudgeInfoWithExtraSourceFiles } from "./ExtraSourceFilesEditor.type";

export type IExtraSourceFilesEditorProps = IEditorComponentProps<IJudgeInfoWithExtraSourceFiles>;

export const ExtraSourceFilesEditor: React.FC<IExtraSourceFilesEditorProps> = (props) => {
    const { judgeInfo, testData, onUpdateJudgeInfo } = props;

    // To support inserting empty items, use a local copy for editing
    // XXX: If the judge info's extraSourceFiles is modified outside this componment, it won't get synced
    //      This componment should be unmounted and remounted.
    type ExtraSourceFiles = Partial<Record<E_CodeLanguage, [string, string, string][]>>; // [uuid, dst, src]
    const [extraSourceFiles, setExtraSourceFiles] = useState<ExtraSourceFiles>(
        Object.fromEntries(
            Object.values(E_CodeLanguage).map((codeLanguage) =>
                judgeInfo.extraSourceFiles
                    ? [
                          codeLanguage,
                          Object.entries(judgeInfo.extraSourceFiles[codeLanguage] || {}).map((a) => [uuid(), ...a]),
                      ]
                    : [codeLanguage, []],
            ),
        ),
    );

    const updateJudgeInfo = useCallback(
        (extraSourceFiles: ExtraSourceFiles) => {
            onUpdateJudgeInfo({
                extraSourceFiles: Object.fromEntries(
                    Object.values(E_CodeLanguage)
                        .map((codeLanguage) =>
                            extraSourceFiles[codeLanguage].length > 0
                                ? [
                                      codeLanguage,
                                      Object.fromEntries(extraSourceFiles[codeLanguage].map((a) => a.slice(1))),
                                  ]
                                : null,
                        )
                        .filter((x) => x),
                ),
            });
        },
        [onUpdateJudgeInfo],
    );

    // Update both a local copy and judge info
    const updateExtraSourceFiles = useCallback(
        (newExtraSourceFiles: ExtraSourceFiles) => {
            setExtraSourceFiles(newExtraSourceFiles);
            updateJudgeInfo(newExtraSourceFiles);
        },
        [updateJudgeInfo],
    );

    // Preverse the local copy
    const onToggleExtraSourceFiles = useCallback(() => {
        if (!judgeInfo.extraSourceFiles) {
            updateJudgeInfo(extraSourceFiles);
        } else {
            onUpdateJudgeInfo({ extraSourceFiles: null });
        }
    }, [extraSourceFiles, onUpdateJudgeInfo, judgeInfo.extraSourceFiles, updateJudgeInfo]);

    const updateExtraSourceFile = useCallback(
        (
            codeLanguage: E_CodeLanguage,
            operation: "ADD" | "DEL" | "UPDATE",
            i?: number,
            newValue?: { src?: string; dst?: string },
        ) => {
            if (operation === "ADD") {
                updateExtraSourceFiles(
                    update(extraSourceFiles, {
                        [codeLanguage]: {
                            $push: [[uuid(), "", ""]],
                        },
                    }),
                );
            } else if (operation === "DEL") {
                updateExtraSourceFiles(
                    update(extraSourceFiles, {
                        [codeLanguage]: {
                            $splice: [[i, 1]],
                        },
                    }),
                );
            } else {
                const item = extraSourceFiles[codeLanguage][i];
                const newDst = newValue.dst == null ? item[1] : newValue.dst;
                const newSrc = newValue.src == null ? item[2] : newValue.src;
                updateExtraSourceFiles(
                    update(extraSourceFiles, {
                        [codeLanguage]: {
                            [i]: {
                                $set: [item[0], newDst, newSrc],
                            },
                        },
                    }),
                );
            }
        },
        [extraSourceFiles, updateExtraSourceFiles],
    );

    return (
        <div>
            <Form>
                <Form.Checkbox
                    checked={!!judgeInfo.extraSourceFiles}
                    label="编译时加入附加源文件"
                    onChange={() => onToggleExtraSourceFiles()}
                />
                {judgeInfo.extraSourceFiles && (
                    <>
                        <Menu className={style.menu + " " + style.menuHeader + " " + style.color_6} attached="top">
                            <Menu.Item className={style.itemTitle}>
                                <strong>附加源文件</strong>
                            </Menu.Item>
                            <Menu.Menu position="right">
                                <Dropdown item icon="plus" className={`icon ${style.itemWithIcon}`}>
                                    <Dropdown.Menu>
                                        {Object.values(E_CodeLanguage).map((codeLanguage) => (
                                            <Dropdown.Item
                                                key={codeLanguage}
                                                text={CodeLanguageString[codeLanguage].name}
                                                onClick={() => updateExtraSourceFile(codeLanguage, "ADD")}
                                            />
                                        ))}
                                    </Dropdown.Menu>
                                </Dropdown>
                            </Menu.Menu>
                        </Menu>
                        {extraSourceFiles &&
                            Object.entries(extraSourceFiles).map(
                                ([codeLanguage, files], iLanguage, { length: lengthLanguage }) =>
                                    files.map(([uuid, dst, src], i) => (
                                        <Menu
                                            className={style.extraSourceFilesItem}
                                            key={uuid}
                                            attached={
                                                i == files.length - 1 && iLanguage === lengthLanguage - 1
                                                    ? "bottom"
                                                    : (true as any)
                                            }
                                        >
                                            <Menu.Item
                                                className={style.itemTitle + " " + style.language}
                                                style={
                                                    i == 0
                                                        ? {
                                                              height: 41 * files.length - 1,
                                                          }
                                                        : {
                                                              visibility: "hidden",
                                                          }
                                                }
                                            >
                                                {CodeLanguageString[codeLanguage]?.name}
                                            </Menu.Item>
                                            <TestDataFileSelector
                                                type="ItemSearchDropdown"
                                                className={style.dropdown}
                                                testData={testData}
                                                placeholder="源文件"
                                                value={src}
                                                onChange={(value) =>
                                                    updateExtraSourceFile(codeLanguage as any, "UPDATE", i, {
                                                        src: value,
                                                    })
                                                }
                                            />
                                            <Menu.Item className={style.input}>
                                                <Input
                                                    icon="long arrow alternate right"
                                                    iconPosition="left"
                                                    transparent
                                                    placeholder="目标文件名"
                                                    value={dst}
                                                    onChange={(e, { value }) =>
                                                        updateExtraSourceFile(codeLanguage as any, "UPDATE", i, {
                                                            dst: value,
                                                        })
                                                    }
                                                />
                                            </Menu.Item>
                                            <Menu.Menu position="right">
                                                <Popup
                                                    trigger={
                                                        <Menu.Item
                                                            className={`icon ${style.itemWithIcon}`}
                                                            icon="delete"
                                                            title="删除"
                                                        />
                                                    }
                                                    content={
                                                        <Button
                                                            negative
                                                            content="确认删除"
                                                            onClick={() =>
                                                                updateExtraSourceFile(codeLanguage as any, "DEL", i)
                                                            }
                                                        />
                                                    }
                                                    on="click"
                                                    position="top center"
                                                />
                                            </Menu.Menu>
                                        </Menu>
                                    )),
                            )}
                    </>
                )}
            </Form>
        </div>
    );
};
