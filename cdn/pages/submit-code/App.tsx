import type React from "react";
import { Button, Form, Grid } from "semantic-ui-react";

import { useScreenWidth } from "<Shared>/Hooks";

import { OptionSelector } from "./OptionSelector";

export const App: React.FC = () => {
    const screenWidth = useScreenWidth();
    const isSmallScreen = screenWidth < 720;
    const singleColumn = screenWidth < 480;

    return (
        <Grid>
            {isSmallScreen && (
                <Grid.Row>
                    <Grid.Column width={16}>
                        <OptionSelector singleColumn={singleColumn} />
                    </Grid.Column>
                </Grid.Row>
            )}
            <Grid.Row>
                <Grid.Column width={isSmallScreen ? 16 : 12} style={{ flexGrow: 1 }}>
                    <Form.Field>
                        <label>代码</label>
                        <textarea name="code" style={{ resize: "none", maxHeight: "unset", height: "500px" }} />
                    </Form.Field>
                </Grid.Column>
                {!isSmallScreen && (
                    <Grid.Column width={4}>
                        <OptionSelector singleColumn={true} />
                        <Form.Field
                            style={{
                                position: "absolute",
                                bottom: 0,
                                left: "1rem",
                                right: "1rem",
                            }}
                        >
                            <Button fluid primary icon="paper plane" labelPosition="left" content="提交" />
                        </Form.Field>
                    </Grid.Column>
                )}
            </Grid.Row>
            {singleColumn && (
                <Grid.Row>
                    <Grid.Column width={16}>
                        <Button fluid primary icon="paper plane" labelPosition="left" content="提交" />
                    </Grid.Column>
                </Grid.Row>
            )}
        </Grid>
    );
};
