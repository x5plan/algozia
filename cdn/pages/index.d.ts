interface IHighlightUtil {
    highlightCodeWithAutoLoadAsync(code: string, lang: string): Promise<string>;
}

// eslint-disable-next-line @typescript-eslint/naming-convention
interface Window {
    readonly HighlightUtil?: IHighlightUtil;
    readonly PageSharedObject: any;
}
