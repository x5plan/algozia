interface Window {
    HighlightUtil: typeof HighlightUtil;
}

namespace HighlightUtil {
    const loadedLanguages: Set<string> = new Set();

    export function checkDependencies() {
        let result = true;

        if (!window.DOMPurify) {
            console.error("DOMPurify is not loaded.");
            result = false;
        }

        if (!window.Prism) {
            console.error("Prism is not loaded.");
            result = false;
        } else if (!window.Prism.plugins.autoloader) {
            console.error("Prism autoloader is not loaded.");
            result = false;
        }

        return result;
    }

    export function loadPrismLanguagesAsync(languages: string[]): Promise<string[]> {
        if (!checkDependencies()) {
            throw new Error("Missed Dependencies");
        }

        const langs = languages.filter((x) => !!x && !loadedLanguages.has(x));

        if (langs.length <= 0) {
            return Promise.resolve([]);
        }

        return new Promise((resolve) => {
            window.Prism.plugins.autoloader.loadLanguages(langs, (successLangs: string[]) => {
                successLangs.forEach((lang) => {
                    loadedLanguages.add(lang);
                });
                resolve(successLangs);
            });
        });
    }

    export function highlightCode(code: string, lang: string) {
        if (!checkDependencies()) {
            throw new Error("Missed Dependencies");
        }

        if (lang && window.Prism.languages[lang]) {
            try {
                return window.Prism.highlight(code, window.Prism.languages[lang], lang);
            } catch (e) {
                console.error(`Failed to highlight, language = ${lang}`, e);
            }
        } else if (lang) {
            console.warn(`Language not supported: ${lang}`);
        }

        return window.DOMPurify.sanitize(
            code
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;")
                .replace(/'/g, "&apos;")
                .replace(/\//g, "&sol;")
                .replace(/\x20/g, "&nbsp;")
                .replace(/\n/g, "<br>"),
            window.GlobalDOMPurifyConfig,
        );
    }

    export async function highlightCodeWithAutoLoadAsync(code: string, lang: string, target?: HTMLElement) {
        if (!checkDependencies()) {
            throw new Error("Missed Dependencies");
        }

        await loadPrismLanguagesAsync([lang]);
        const html = highlightCode(code, lang);

        if (target) {
            target.innerHTML = html;
        }

        return html;
    }
}

window.HighlightUtil = HighlightUtil;
