import { useCallback } from "preact/hooks";
import type React from "react";
import { Form, Header, Input, Menu, Segment } from "semantic-ui-react";

import { CodeLanguageAndOptions } from "../../../shared/CodeLanguageAndOptions";
import type { E_CodeLanguage } from "../../../shared/Enums";
import style from "../Shared/CheckerEditor/CheckerEditor.module.less";
import type { IJudgeInfoWithExtraSourceFiles } from "../Shared/ExtraSourceFilesEditor";
import { ExtraSourceFilesEditor } from "../Shared/ExtraSourceFilesEditor";
import type { IJudgeInfoWithMeta } from "../Shared/MetaEditor";
import { MetaEditor } from "../Shared/MetaEditor";
import type { IJudgeInfoWithSubtasks } from "../Shared/SubtasksEditor";
import { SubtasksEditor } from "../Shared/SubtasksEditor";
import { TestDataFileSelector } from "../Shared/TestDataFileSelector";
import type { IEditorComponentProps } from "../Shared/Type";
import { metaEditorOptions, subtasksEditorOptions } from "./InteractionProblemEditor.util";

export interface IInteractorConfig {
    interface: InteractorInterface;
    sharedMemorySize?: number;
    language: E_CodeLanguage;
    compileAndRunOptions: Record<string, unknown>;
    filename: string;
    timeLimit?: number;
    memoryLimit?: number;
}

interface IJudgeInfoWithInteractor {
    interactor?: IInteractorConfig;
}

export type IJudgeInfoInteraction = IJudgeInfoWithMeta &
    IJudgeInfoWithSubtasks &
    IJudgeInfoWithInteractor &
    IJudgeInfoWithExtraSourceFiles;

type InteractorInterface = "stdio" | "shm";

const interactorInterfaces: InteractorInterface[] = ["stdio", "shm"];

export type InteractionProblemEditorProps = IEditorComponentProps<IJudgeInfoInteraction>;

export const InteractionProblemEditor: React.FC<InteractionProblemEditorProps> = (props) => {
    const { testData, judgeInfo, onUpdateJudgeInfo } = props;

    const interactor = judgeInfo.interactor;

    const onUpdateInteractor = useCallback(
        (delta: Partial<IInteractorConfig>) => {
            onUpdateJudgeInfo(({ interactor }) => {
                return {
                    interactor: { ...interactor, ...delta },
                };
            });
        },
        [onUpdateJudgeInfo],
    );

    return (
        <>
            <MetaEditor
                judgeInfo={judgeInfo}
                testData={testData}
                onUpdateJudgeInfo={onUpdateJudgeInfo}
                options={metaEditorOptions}
            />
            <Form className={style.wrapper}>
                <div className={style.menuWrapper}>
                    <Header size="tiny" content="交互器" />
                    <Menu secondary pointing>
                        {interactorInterfaces.map((interactorInterface) => (
                            <Menu.Item
                                key={interactorInterface}
                                content={
                                    {
                                        stdio: "标准输入/输出",
                                        shm: "共享内存",
                                    }[interactorInterface]
                                }
                                active={interactor.interface === interactorInterface}
                                onClick={() =>
                                    interactor.interface !== interactorInterface &&
                                    onUpdateInteractor({
                                        interface: interactorInterface,
                                        sharedMemorySize: interactorInterface === "shm" ? 4 : null,
                                    })
                                }
                            />
                        ))}
                    </Menu>
                </div>
                <Segment color="grey" className={style.checkerConfig}>
                    <div className={style.custom}>
                        <TestDataFileSelector
                            type="FormSelect"
                            label="文件"
                            placeholder="无文件"
                            value={interactor.filename}
                            testData={props.testData}
                            onChange={(value) => onUpdateInteractor({ filename: value })}
                        />
                        <div className={style.compileAndRunOptions}>
                            <CodeLanguageAndOptions
                                language={interactor.language}
                                compileAndRunOptions={interactor.compileAndRunOptions}
                                onUpdateLanguage={(newLanguage) => onUpdateInteractor({ language: newLanguage })}
                                onUpdateCompileAndRunOptions={(compileAndRunOptions) =>
                                    onUpdateInteractor({ compileAndRunOptions: compileAndRunOptions })
                                }
                            />
                            <Form.Field style={{ visibility: interactor.interface === "shm" ? "" : "hidden" }}>
                                <label>共享内存大小</label>
                                <Input
                                    value={normalizeSharedMemorySize(interactor.sharedMemorySize)}
                                    type="number"
                                    min={4}
                                    max={128}
                                    label="MiB"
                                    labelPosition="right"
                                    onChange={(e, { value }) =>
                                        onUpdateInteractor({
                                            sharedMemorySize: normalizeSharedMemorySize(Number(value)),
                                        })
                                    }
                                />
                            </Form.Field>
                        </div>
                        <Form.Group>
                            <Form.Field width={8}>
                                <label>时间限制</label>
                                <Input
                                    className={style.labeledInput}
                                    placeholder={judgeInfo["timeLimit"]}
                                    value={interactor.timeLimit == null ? "" : interactor.timeLimit}
                                    label="ms"
                                    labelPosition="right"
                                    icon="clock"
                                    iconPosition="left"
                                    onChange={(e, { value }) =>
                                        (value === "" || (Number.isSafeInteger(Number(value)) && Number(value) >= 0)) &&
                                        onUpdateInteractor({ timeLimit: value === "" ? null : Number(value) })
                                    }
                                />
                            </Form.Field>
                            <Form.Field width={8}>
                                <label>内存限制</label>
                                <Input
                                    className={style.labeledInput}
                                    placeholder={judgeInfo["memoryLimit"]}
                                    value={interactor.memoryLimit == null ? "" : interactor.memoryLimit}
                                    label="MiB"
                                    labelPosition="right"
                                    icon="microchip"
                                    iconPosition="left"
                                    onChange={(e, { value }) =>
                                        (value === "" || (Number.isSafeInteger(Number(value)) && Number(value) >= 0)) &&
                                        onUpdateInteractor({ memoryLimit: value === "" ? null : Number(value) })
                                    }
                                />
                            </Form.Field>
                        </Form.Group>
                    </div>
                </Segment>
            </Form>
            <SubtasksEditor
                judgeInfo={judgeInfo}
                testData={testData}
                onUpdateJudgeInfo={onUpdateJudgeInfo}
                options={subtasksEditorOptions}
            />
            <ExtraSourceFilesEditor judgeInfo={judgeInfo} testData={testData} onUpdateJudgeInfo={onUpdateJudgeInfo} />
        </>
    );
};

function normalizeSharedMemorySize(x: number) {
    x = Math.round(x);
    if (x < 4) return 4;
    if (x > 128) return 128;
    return x;
}
