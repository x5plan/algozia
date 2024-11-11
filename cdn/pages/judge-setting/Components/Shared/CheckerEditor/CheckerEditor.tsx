import { useCallback, useRef } from "preact/compat";
import React from "react";
import { Form, Header, Input, Menu, Segment } from "semantic-ui-react";

import { CodeLanguageAndOptions } from "<Shared>/CodeLanguageAndOptions";

import { TestDataFileSelector } from "../TestDataFileSelector";
import type { IEditorComponentProps } from "../Type";
import style from "./CheckerEditor.module.less";
import type { ICheckerConfig, ICheckerType, IJudgeInfoWithChecker } from "./CheckerEditor.type";
import { CHECKER_TYPES, CUSTOM_CHECKER_INTERFACES, parseCheckerConfig } from "./CheckerEditor.util";

export type ICheckerEditorProps = IEditorComponentProps<IJudgeInfoWithChecker>;

export const CheckerEditor: React.FC<ICheckerEditorProps> = (props) => {
    const { testData, judgeInfo, onUpdateJudgeInfo } = props;
    const { checker } = judgeInfo;

    const checkerConfigBackup = useRef<Map<ICheckerType, ICheckerConfig>>(new Map());

    const onUpdateChecker = useCallback(
        (delta: Partial<ICheckerConfig>) => {
            onUpdateJudgeInfo(({ checker }) => ({
                checker: Object.assign({}, checker, delta),
            }));
        },
        [onUpdateJudgeInfo],
    );

    const onChangeCheckerType = useCallback(
        (type: ICheckerType) => {
            if (type === checker.type) return;
            checkerConfigBackup.current.set(checker.type, checker);

            onUpdateJudgeInfo({
                checker: checkerConfigBackup.current.get(type) || parseCheckerConfig({ type }, testData),
            });
        },
        [checker, onUpdateJudgeInfo, testData],
    );

    return (
        <Form className={style.wrapper}>
            <div className={style.menuWrapper}>
                <Header size="tiny" content="检查器" />
                <Menu secondary pointing>
                    {CHECKER_TYPES.map((type) => (
                        <Menu.Item
                            key={type}
                            content={
                                {
                                    integers: "整数",
                                    floats: "浮点数",
                                    lines: "行比较",
                                    binary: "二进制比较",
                                    custom: "自定义",
                                }[type]
                            }
                            active={checker.type === type}
                            onClick={() => checker.type !== type && onChangeCheckerType(type)}
                        />
                    ))}
                </Menu>
            </div>
            <Segment color="grey" className={style.checkerConfig}>
                {(() => {
                    switch (checker.type) {
                        case "integers":
                            return null;
                        case "floats":
                            return (
                                <>
                                    <Form.Field width={8}>
                                        <label>误差位数</label>
                                        <Input
                                            value={checker.precision}
                                            onChange={(e, { value }) =>
                                                (value === "" ||
                                                    (Number.isSafeInteger(Number(value)) && Number(value) > 0)) &&
                                                onUpdateChecker({ precision: Number(value) })
                                            }
                                        />
                                    </Form.Field>
                                    <div className={style.description}>
                                        若用户输出的结果与正确答案的绝对误差或相对误差不超过 1e-{checker.precision}{" "}
                                        则视为正确。
                                    </div>
                                </>
                            );
                        case "lines":
                            return (
                                <>
                                    <Form.Checkbox
                                        toggle
                                        label="区分大小写"
                                        checked={checker.caseSensitive}
                                        onChange={(e, { checked }) => onUpdateChecker({ caseSensitive: checked })}
                                    />
                                    <div className={style.description}>行末的空白字符与文末的空白行将被忽略。</div>
                                </>
                            );
                        case "binary":
                            return null;
                        case "custom":
                            return (
                                <div className={style.custom}>
                                    <TestDataFileSelector
                                        type="FormSelect"
                                        label="文件"
                                        placeholder="无文件"
                                        value={checker.filename}
                                        testData={testData}
                                        onChange={(value) => onUpdateChecker({ filename: value })}
                                    />
                                    <div className={style.compileAndRunOptions}>
                                        <Form.Select
                                            label="接口"
                                            value={checker.interface}
                                            options={CUSTOM_CHECKER_INTERFACES.map((iface) => ({
                                                key: iface,
                                                value: iface,
                                                text: {
                                                    testlib: "Testlib",
                                                    legacy: "SYZOJ 2",
                                                    lemon: "Lemon",
                                                    hustoj: "HustOJ",
                                                    qduoj: "QDUOJ",
                                                    domjudge: "DOMjudge",
                                                }[iface]!,
                                            }))}
                                            onChange={(e, { value }) => onUpdateChecker({ interface: value as any })}
                                        />
                                        <CodeLanguageAndOptions
                                            language={checker.language}
                                            compileAndRunOptions={checker.compileAndRunOptions}
                                            onUpdateLanguage={(newLanguage) =>
                                                onUpdateChecker({ language: newLanguage })
                                            }
                                            onUpdateCompileAndRunOptions={(compileAndRunOptions) =>
                                                onUpdateChecker({ compileAndRunOptions: compileAndRunOptions })
                                            }
                                        />
                                    </div>
                                    <Form.Group>
                                        <Form.Field width={8}>
                                            <label>时间限制</label>
                                            <Input
                                                className={style.labeledInput}
                                                placeholder={judgeInfo["timeLimit"] ?? "时间限制"}
                                                value={checker.timeLimit == null ? "" : checker.timeLimit}
                                                label="ms"
                                                labelPosition="right"
                                                icon="clock"
                                                iconPosition="left"
                                                onChange={(e, { value }) =>
                                                    (value === "" ||
                                                        (Number.isSafeInteger(Number(value)) && Number(value) >= 0)) &&
                                                    onUpdateChecker({ timeLimit: value === "" ? null : Number(value) })
                                                }
                                            />
                                        </Form.Field>
                                        <Form.Field width={8}>
                                            <label>内存限制</label>
                                            <Input
                                                className={style.labeledInput}
                                                placeholder={judgeInfo["memoryLimit"] ?? "内存限制"}
                                                value={checker.memoryLimit == null ? "" : checker.memoryLimit}
                                                label="MiB"
                                                labelPosition="right"
                                                icon="microchip"
                                                iconPosition="left"
                                                onChange={(e, { value }) =>
                                                    (value === "" ||
                                                        (Number.isSafeInteger(Number(value)) && Number(value) >= 0)) &&
                                                    onUpdateChecker({
                                                        memoryLimit: value === "" ? null : Number(value),
                                                    })
                                                }
                                            />
                                        </Form.Field>
                                    </Form.Group>
                                </div>
                            );
                    }
                })()}
            </Segment>
        </Form>
    );
};
