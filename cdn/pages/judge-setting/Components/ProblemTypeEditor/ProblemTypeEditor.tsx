import { useState } from "preact/hooks";
import type React from "react";
import { Button, Dropdown, Form, Popup } from "semantic-ui-react";

import { E_ProblemType } from "../../../shared/Enums";
import style from "./ProblemTypeEditor.module.less";

export interface IProblemTypeEditorProps {
    type: E_ProblemType;
    hasSubmission: boolean;
    onTypeChange: (type: E_ProblemType) => void;
}

export const ProblemTypeEditor: React.FC<IProblemTypeEditorProps> = (props) => {
    const { type, hasSubmission, onTypeChange } = props;

    const [newType, setNewType] = useState(type);
    const [switchProblemPopupOpen, setSwitchProblemPopupOpen] = useState(false);

    return (
        <Form className={style.problemTypeForm}>
            <div style={{ marginBottom: 14 }}>
                <strong>为了避免系统出错，已有提交的题目不允许在提交答案和非提交答案之间更改。</strong>
            </div>
            <Form.Field inline width={16} className={style.field}>
                <label className={style.label}>题目类型</label>
                <Dropdown
                    className={style.dropdown}
                    selection
                    value={newType}
                    options={Object.values(E_ProblemType).map((t) => ({
                        key: t,
                        value: t,
                        text: {
                            [E_ProblemType.Traditional]: "传统",
                            [E_ProblemType.SubmitAnswer]: "提交答案",
                            [E_ProblemType.Interaction]: "交互",
                        }[t],
                        disabled:
                            hasSubmission &&
                            (t === E_ProblemType.SubmitAnswer
                                ? type !== E_ProblemType.SubmitAnswer
                                : type === E_ProblemType.SubmitAnswer),
                    }))}
                    onChange={(e, { value }) => setNewType(value as E_ProblemType)}
                />
                <Popup
                    trigger={<Button disabled={newType === type} className={style.switchButton} content="切换" />}
                    content={
                        <div>
                            <p>切换题目类型会清空已有的测试数据和评测信息，是否确认切换？</p>
                            <Button
                                negative
                                content="确认"
                                onClick={() => {
                                    onTypeChange(newType);
                                    setSwitchProblemPopupOpen(false);
                                }}
                            />
                        </div>
                    }
                    open={switchProblemPopupOpen}
                    onOpen={() => setSwitchProblemPopupOpen(true)}
                    onClose={() => setSwitchProblemPopupOpen(false)}
                    position="top center"
                    on="click"
                />
            </Form.Field>
        </Form>
    );
};
