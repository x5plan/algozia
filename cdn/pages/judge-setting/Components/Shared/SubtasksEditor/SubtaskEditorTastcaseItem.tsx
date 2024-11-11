import { useState } from "preact/hooks";
import type React from "react";
import { Button, Dropdown, Input, Menu, Popup, Ref } from "semantic-ui-react";

import { TestDataFileSelector } from "../TestDataFileSelector";
import style from "./SubtasksEditor.module.less";
import type { ISubtasksEditorOptions, ITestcase } from "./SubtasksEditor.type";
import { randomColorFromUuid } from "./SubtasksEditor.util";

export interface ISubtaskEditorTestcaseItemProps {
    options: ISubtasksEditorOptions;

    testData: string[];
    testcaseIndex: number;
    testcaseCount: number;
    testcase: ITestcase;

    defaultPercentagePoints: number;
    defaultTimeLimit: number;
    defaultMemoryLimit: number;

    onUpdate: (updateInfo: Partial<ITestcase>) => void;
    onDelete: () => void;
    onMoveUp: () => void;
    onMoveDown: () => void;
    onAddTestcaseBefore: () => void;
    onAddTestcaseAfter: () => void;
}

export const SubtaskEditorTastcaseItem: React.FC<ISubtaskEditorTestcaseItemProps> = (props) => {
    const [refOptionsButton, setRefOptionsButton] = useState<HTMLElement>(null);

    return (
        <>
            <Menu
                className={
                    style.menu +
                    " " +
                    style.menuTestcase +
                    " " +
                    style.menuTestcaseFirstLine +
                    " " +
                    style["color_" + randomColorFromUuid(props.testcase.uuid)]
                }
                attached
            >
                <Menu.Item className={style.itemTestcaseTitle}>#{props.testcaseIndex + 1}</Menu.Item>
                {props.options.enableInputFile ? (
                    <TestDataFileSelector
                        type="ItemSearchDropdown"
                        iconInputOrOutput="sign in"
                        testData={props.testData}
                        placeholder="输入文件"
                        optional={props.options.enableInputFile === "optional"}
                        value={props.testcase.inputFile}
                        onChange={(value) => props.onUpdate({ inputFile: value })}
                    />
                ) : (
                    <Menu.Item className={style.outputFileNotNeeded} content="不需要输入文件" />
                )}
                <Menu.Menu position="right">
                    {props.options.enableUserOutputFilename && (
                        <Menu.Item className={style.itemTestcaseUserOutputFilename}></Menu.Item>
                    )}
                    {props.options.enableTimeMemoryLimit && (
                        <>
                            <Menu.Item className={style.itemTestcaseTimeLimit}>
                                <Input
                                    transparent
                                    placeholder={props.defaultTimeLimit}
                                    value={props.testcase.timeLimit == null ? "" : props.testcase.timeLimit}
                                    icon="clock"
                                    iconPosition="left"
                                    onChange={(e, { value }) =>
                                        (value === "" || (Number.isSafeInteger(Number(value)) && Number(value) >= 0)) &&
                                        props.onUpdate({ timeLimit: value === "" ? null : Number(value) })
                                    }
                                />
                            </Menu.Item>
                            <Menu.Item className={style.itemLabel}>ms</Menu.Item>
                        </>
                    )}
                    <Dropdown item icon="plus" className={`icon ${style.itemWithIcon}`}>
                        <Dropdown.Menu>
                            <Dropdown.Item
                                icon="angle double up"
                                text="在此测试点前"
                                onClick={() => props.onAddTestcaseBefore()}
                            />
                            <Dropdown.Item
                                icon="angle double down"
                                text="在此测试点后"
                                onClick={() => props.onAddTestcaseAfter()}
                            />
                        </Dropdown.Menu>
                    </Dropdown>
                </Menu.Menu>
            </Menu>
            <Menu
                className={
                    style.menu +
                    " " +
                    style.menuTestcase +
                    " " +
                    style.menuTestcaseSecondLine +
                    " " +
                    style["color_" + randomColorFromUuid(props.testcase.uuid)]
                }
                attached
            >
                <Menu.Item className={style.itemTestcaseScore}>
                    <Input
                        transparent
                        placeholder={props.defaultPercentagePoints}
                        value={props.testcase.points == null ? "" : props.testcase.points}
                        disabled={props.testcaseCount === 1}
                        icon="percent"
                        onChange={(e, { value }) =>
                            (value === "" ||
                                (Number.isSafeInteger(Number(value)) && Number(value) >= 0 && Number(value) <= 100)) &&
                            props.onUpdate({ points: value === "" ? null : Number(value) })
                        }
                    />
                </Menu.Item>
                {props.options.enableOutputFile ? (
                    <TestDataFileSelector
                        type="ItemSearchDropdown"
                        iconInputOrOutput="sign out"
                        testData={props.testData}
                        placeholder="输出文件"
                        optional={props.options.enableOutputFile === "optional"}
                        value={props.testcase.outputFile}
                        onChange={(value) => props.onUpdate({ outputFile: value })}
                    />
                ) : (
                    <Menu.Item className={style.outputFileNotNeeded} content="不需要输出文件" />
                )}
                <Menu.Menu position="right">
                    {props.options.enableUserOutputFilename && (
                        <Menu.Item className={style.itemTestcaseUserOutputFilename}>
                            <Input
                                transparent
                                placeholder={props.testcase.outputFile || "用户输出文件名"}
                                value={
                                    props.testcase.userOutputFilename == null ? "" : props.testcase.userOutputFilename
                                }
                                icon="file code outline"
                                iconPosition="left"
                                onChange={(e, { value }) =>
                                    props.onUpdate({ userOutputFilename: value === "" ? null : value })
                                }
                            />
                        </Menu.Item>
                    )}
                    {props.options.enableTimeMemoryLimit && (
                        <>
                            <Menu.Item className={style.itemTestcaseMemoryLimit}>
                                <Input
                                    transparent
                                    placeholder={props.defaultMemoryLimit}
                                    value={props.testcase.memoryLimit == null ? "" : props.testcase.memoryLimit}
                                    icon="microchip"
                                    iconPosition="left"
                                    onChange={(e, { value }) =>
                                        (value === "" || (Number.isSafeInteger(Number(value)) && Number(value) >= 0)) &&
                                        props.onUpdate({ memoryLimit: value === "" ? null : Number(value) })
                                    }
                                />
                            </Menu.Item>
                            <Menu.Item className={style.itemLabel}>MiB</Menu.Item>
                        </>
                    )}
                    <Ref innerRef={setRefOptionsButton}>
                        <Dropdown item icon="bars" className={`icon ${style.itemWithIcon}`}>
                            <Dropdown.Menu>
                                <Dropdown.Item
                                    icon="angle double up"
                                    text="上移"
                                    onClick={() => props.onMoveUp()}
                                    disabled={props.testcaseIndex === 0}
                                />
                                <Dropdown.Item
                                    icon="angle double down"
                                    text="下移"
                                    onClick={() => props.onMoveDown()}
                                    disabled={props.testcaseIndex === props.testcaseCount - 1}
                                />
                                <Popup
                                    trigger={<Dropdown.Item icon="delete" text="删除" />}
                                    context={refOptionsButton}
                                    content={<Button negative content="确认删除" onClick={() => props.onDelete()} />}
                                    on="click"
                                    position="bottom center"
                                />
                            </Dropdown.Menu>
                        </Dropdown>
                    </Ref>
                </Menu.Menu>
            </Menu>
        </>
    );
};
