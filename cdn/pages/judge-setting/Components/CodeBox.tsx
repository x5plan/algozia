import { dump } from "js-yaml";
import { useMemo, useRef, useState } from "preact/hooks";
import React from "react";
import { Segment } from "semantic-ui-react";
import { v4 as uuid } from "uuid";

interface ICodeBoxProps {
    readonly judgeInfo: any;
}

export const CodeBox: React.FC<ICodeBoxProps> = (props) => {
    const { judgeInfo } = props;
    const latestRenderIdRef = useRef<string>("");
    const [html, setHtml] = useState<string>("");
    const judgeInfoYaml = useMemo(() => dumpJudgeInfo(judgeInfo), [judgeInfo]);

    React.useEffect(() => {
        latestRenderIdRef.current = uuid();
        highlightAsync(judgeInfoYaml, latestRenderIdRef.current).then(({ id, code }) => {
            if (id === latestRenderIdRef.current) {
                setHtml(code);
            }
        });
    }, [judgeInfoYaml]);

    return (
        <>
            <h3>配置文件</h3>
            <Segment>
                <pre style={{ padding: 0, margin: 0 }}>
                    <code dangerouslySetInnerHTML={{ __html: html }} />
                </pre>
            </Segment>
        </>
    );
};

async function highlightAsync(code: string, id: string): Promise<{ id: string; code: string }> {
    if (!window.HighlightUtil) {
        return {
            id,
            code: code
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;")
                .replace(/'/g, "&apos;")
                .replace(/\//g, "&sol;")
                .replace(/\x20/g, "&nbsp;")
                .replace(/\n/g, "<br>"),
        };
    }

    return {
        id,
        code: await window.HighlightUtil.highlightCodeWithAutoLoadAsync(code, "yaml"),
    };
}

function dumpJudgeInfo(judgeInfo: any): string {
    try {
        return dump(judgeInfo, { lineWidth: 50 });
    } catch (e) {
        console.error("Failed to dump judge info", e);
        return "无法序列化 YAML";
    }
}
