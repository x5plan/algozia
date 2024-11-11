interface Window {
    markdownit: typeof import("markdown-it");
    markdownitMath: any;
    MarkdownUtil: typeof MarkdownUtil;
    HighlightUtil: typeof HighlightUtil;
}

namespace MarkdownUtil {
    const depsPromises: Promise<void>[] = [];

    export interface IHighlightPlaceholder {
        readonly id: string;
        readonly code: string;
        readonly lang: string;
    }

    export interface IMathPlaceholder {
        readonly id: string;
        readonly math: string;
        readonly display: boolean;
    }

    export interface IRenderedMarkdown {
        readonly html: string;
        readonly highlightPlaceholders: IHighlightPlaceholder[];
        readonly mathPlaceholders: IMathPlaceholder[];
    }

    // Use a <span> placeholder for highlights and maths
    // They're replaced after HTML sanitation
    function generatePlaceholder(id: string) {
        return `<span md-data-id="${id}"></span>`;
    }

    function getPlaceholderElement(wrapperElement: HTMLElement, id: string): HTMLSpanElement {
        return wrapperElement.querySelector(`span[md-data-id="${id}"]`) as HTMLSpanElement;
    }

    function randomUUID() {
        if (window.crypto.randomUUID && typeof window.crypto.randomUUID === "function") {
            return window.crypto.randomUUID();
        }

        return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (r) => {
            const c = Number(r);
            return (c ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))).toString(16);
        });
    }

    function checkDependencies() {
        let result = true;

        if (!window.markdownit) {
            console.error("MarkdownIt is not loaded.");
            result = false;
        }

        if (!window.HighlightUtil) {
            console.error("HighlightUtil is not loaded.");
            result = false;
        } else if (!window.HighlightUtil.checkDependencies()) {
            result = false;
        }

        // DOMPurify has been checked in HighlightUtil.checkDependencies()

        if (!window.katex) {
            console.error("KaTeX is not loaded.");
            result = false;
        }

        if (!window.markdownitMath) {
            console.error("markdownit-math is not loaded.");
            result = false;
        }

        return result;
    }

    function renderMarkdown(content: string): IRenderedMarkdown {
        const highlightPlaceholders: IHighlightPlaceholder[] = [];
        const mathPlaceholders: IMathPlaceholder[] = [];

        const renderer = window.markdownit({
            html: true,
            breaks: false,
            linkify: true,
            typographer: true,
            highlight: (code, lang) => {
                const id = randomUUID();
                highlightPlaceholders.push({
                    id,
                    code: code.replace(/\r\n/g, "\n"),
                    lang: lang.trim().toLowerCase(),
                });

                return `<pre><code>${generatePlaceholder(id)}</code></pre>`;
            },
        });

        renderer.use(window.markdownitMath, {
            inlineOpen: "$",
            inlineClose: "$",
            blockOpen: "$$",
            blockClose: "$$",
            inlineRenderer: (math: string) => {
                const id = randomUUID();
                mathPlaceholders.push({
                    id,
                    math,
                    display: false,
                });

                return generatePlaceholder(id);
            },
            blockRenderer: (math: string) => {
                const id = randomUUID();
                mathPlaceholders.push({
                    id,
                    math,
                    display: true,
                });

                return generatePlaceholder(id);
            },
        });

        return {
            html: renderer.render(content),
            highlightPlaceholders,
            mathPlaceholders,
        };
    }

    export function patchUIStyles(element: HTMLElement) {
        element.querySelectorAll("pre").forEach((pre) => {
            pre.style.marginTop = "0";
            pre.style.marginBottom = "0";
            pre.outerHTML = `<div class="ui existing segment">${pre.outerHTML}</div>`;
        });

        element.querySelectorAll("table").forEach((table) => {
            table.classList.add("ui", "structured", "celled", "table");
        });

        element.querySelectorAll("blockquote").forEach((blockquote) => {
            blockquote.outerHTML = `<div class="ui message">${blockquote.innerHTML}</div>`;
        });
    }

    export async function renderSanitizedMarkdownAsync(
        content: string,
        target?: HTMLElement,
        patchUI = true,
    ): Promise<string> {
        const element = document.createElement("div");

        await Promise.all(depsPromises);

        if (!checkDependencies()) {
            throw new Error("Missed Dependencies");
        }

        const { html, highlightPlaceholders, mathPlaceholders } = renderMarkdown(content);

        element.innerHTML = window.DOMPurify.sanitize(html, window.GlobalDOMPurifyConfig);
        element.classList.add("markdown-content");

        await window.HighlightUtil.loadPrismLanguagesAsync(highlightPlaceholders.map((x) => x.lang));

        highlightPlaceholders.forEach(({ id, code, lang }) => {
            getPlaceholderElement(element, id).outerHTML = window.HighlightUtil.highlightCode(code, lang);
        });

        mathPlaceholders.forEach(({ id, math, display }) => {
            getPlaceholderElement(element, id).outerHTML = window.katex.renderToString(math, {
                displayMode: display,
                throwOnError: false,
            });
        });

        if (patchUI) {
            patchUIStyles(element);
        }

        if (target) {
            target.appendChild(element);
        }

        return element.outerHTML;
    }

    export function registerDepsOnLoad() {
        let onLoad: () => void = () => {};
        let onError: (e: Error) => void = () => {};

        const promise = new Promise<void>((res, rej) => {
            onLoad = res;
            onError = rej;
        });

        depsPromises.push(promise);

        return [onLoad, onError];
    }
}

window.MarkdownUtil = MarkdownUtil;
