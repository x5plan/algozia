import { useState } from "preact/hooks";
import React from "react";
import { Button, Grid, Message, MessageItem } from "semantic-ui-react";
import { v4 as uuid } from "uuid";

import { useScreenWidth } from "<Shared>/Hooks";

import type { E_ProblemType } from "../shared/Enums";
import { CodeBox } from "./Components/CodeBox";
import { JudgeInfoEditor } from "./Components/JudgeSettingEditor";
import { ProblemTypeEditor } from "./Components/ProblemTypeEditor";
import { getSharedObject } from "./Utils";

export const App: React.FC = () => {
    const data = getSharedObject();
    const [editorKey, setEditorKey] = useState(uuid());

    const [normalizeJudgeInfo, setNormalizeJudgeInfo] = useState<any>(data.info);
    const [problemType, setProblemType] = useState<E_ProblemType>(data.type as E_ProblemType);
    const screenWidth = useScreenWidth();
    const isSmallScreen = screenWidth < 992;

    return (
        <Grid>
            <Grid.Row>
                <Grid.Column textAlign={"center"}>
                    <h1>{data.title}</h1>
                </Grid.Column>
            </Grid.Row>

            {data.error && (
                <Grid.Row>
                    <Grid.Column>
                        <Message error>{data.error}</Message>
                    </Grid.Column>
                </Grid.Row>
            )}

            <Grid.Row>
                {!isSmallScreen && (
                    <Grid.Column width={7}>
                        <CodeBox judgeInfo={normalizeJudgeInfo} />
                    </Grid.Column>
                )}
                <Grid.Column width={isSmallScreen ? 16 : 9}>
                    <ProblemTypeEditor
                        type={problemType}
                        hasSubmission={data.hasSubmissions}
                        onTypeChange={(type) => {
                            setProblemType(type);
                            setEditorKey(uuid());
                        }}
                    />
                    <JudgeInfoEditor
                        key={editorKey}
                        problemType={problemType}
                        judgeInfoRaw={data.info}
                        testData={data.testDataFileNames}
                        onUpdateNomalizedJudgeInfo={(judgeInfo) => {
                            setNormalizeJudgeInfo(judgeInfo);
                        }}
                    />
                </Grid.Column>
            </Grid.Row>

            <Grid.Row as="form" method="post" action={data.postUrl}>
                <Grid.Column textAlign="right">
                    <div style={"display: none;"}>
                        <input type="hidden" name="type" value={problemType} />
                        <input type="hidden" name="info" value={JSON.stringify(normalizeJudgeInfo)} />
                    </div>
                    <Button as="a" type="button" href={data.problemUrl}>
                        返回题目
                    </Button>
                    <Button type="submit" primary>
                        提交
                    </Button>
                </Grid.Column>
            </Grid.Row>

            {isSmallScreen && (
                <Grid.Row>
                    <Grid.Column width={16}>
                        <CodeBox judgeInfo={normalizeJudgeInfo} />
                    </Grid.Column>
                </Grid.Row>
            )}
        </Grid>
    );
};
