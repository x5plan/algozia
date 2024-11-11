import React from "react";
import { Form, Input } from "semantic-ui-react";

import type { IEditorComponentProps } from "../Type";
import style from "./MetaEditor.module.less";
import type { IJudgeInfoWithMeta, IMetaEditorOptions } from "./MetaEditor.type";

export type IMetaEditorProps = IEditorComponentProps<IJudgeInfoWithMeta, IMetaEditorOptions>;

export const MetaEditor: React.FC<IMetaEditorProps> = (props) => {
    const { judgeInfo, options, onUpdateJudgeInfo } = props;

    return (
        <div>
            <Form>
                {options.enableTimeMemoryLimit && (
                    <Form.Group>
                        <Form.Field width={8}>
                            <label>时间限制</label>
                            <Input
                                className={style.labeledInput}
                                value={judgeInfo.timeLimit == null ? "" : judgeInfo.timeLimit}
                                label="ms"
                                labelPosition="right"
                                icon="clock"
                                iconPosition="left"
                                onChange={(e, { value }) =>
                                    (value === "" || (Number.isSafeInteger(Number(value)) && Number(value) >= 0)) &&
                                    onUpdateJudgeInfo({ timeLimit: value === "" ? null : Number(value) })
                                }
                            />
                        </Form.Field>
                        <Form.Field width={8}>
                            <label>内存限制</label>
                            <Input
                                className={style.labeledInput}
                                value={judgeInfo.memoryLimit == null ? "" : judgeInfo.memoryLimit}
                                label="MiB"
                                labelPosition="right"
                                icon="microchip"
                                iconPosition="left"
                                onChange={(e, { value }) =>
                                    (value === "" || (Number.isSafeInteger(Number(value)) && Number(value) >= 0)) &&
                                    onUpdateJudgeInfo({ memoryLimit: value === "" ? null : Number(value) })
                                }
                            />
                        </Form.Field>
                    </Form.Group>
                )}
                {options.enableFileIo && judgeInfo.fileIo && (
                    <Form.Group>
                        <Form.Field width={8}>
                            <label>输入文件</label>
                            <Input
                                value={judgeInfo.fileIo.inputFilename}
                                readOnly={!judgeInfo.fileIo}
                                icon="sign in"
                                iconPosition="left"
                                onChange={(e, { value }) =>
                                    onUpdateJudgeInfo({
                                        fileIo: {
                                            inputFilename: value,
                                            outputFilename: judgeInfo.fileIo.outputFilename,
                                        },
                                    })
                                }
                            />
                        </Form.Field>
                        <Form.Field width={8}>
                            <label>输出文件</label>
                            <Input
                                value={judgeInfo.fileIo.outputFilename}
                                readOnly={!judgeInfo.fileIo}
                                icon="sign out"
                                iconPosition="left"
                                onChange={(e, { value }) =>
                                    onUpdateJudgeInfo({
                                        fileIo: {
                                            inputFilename: judgeInfo.fileIo.inputFilename,
                                            outputFilename: value,
                                        },
                                    })
                                }
                            />
                        </Form.Field>
                    </Form.Group>
                )}
                {options.enableFileIo && (
                    <Form.Group>
                        <Form.Checkbox
                            className={style.checkbox}
                            width={8}
                            label="使用标准输入输出"
                            checked={!judgeInfo.fileIo}
                            onChange={(e, { checked }) =>
                                onUpdateJudgeInfo({
                                    fileIo: checked ? null : { inputFilename: "", outputFilename: "" },
                                })
                            }
                        />
                    </Form.Group>
                )}
            </Form>
        </div>
    );
};
