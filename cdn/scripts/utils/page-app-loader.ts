interface Window {
    PageAppLoaderUtil: typeof PageAppLoaderUtil;
    PageSharedObject: any;
    __viteDev__?: string;
}

interface IViteChunk {
    file: string;
    name: string;
    src: string;
    isEntry?: boolean;
    isDynamicEntry?: boolean;
    imports: string[];
    dynamicImports?: string[];
    css?: string[];
}

namespace PageAppLoaderUtil {
    function injectCss(url: string) {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = url;
        document.head.appendChild(link);
    }

    function injectScript(url: string) {
        const script = document.createElement("script");
        script.src = url;
        script.type = "module";
        document.body.appendChild(script);
    }

    function injectViteDevScript(baseUrl: string) {
        const script = document.createElement("script");
        script.innerHTML = `import RefreshRuntime from '${baseUrl}@react-refresh';
RefreshRuntime.injectIntoGlobalHook(window);
window.$RefreshReg$ = () => {};
window.$RefreshSig$ = () => (type) => type;
window.__vite_plugin_react_preamble_installed__ = true;`;
    }

    export function loadPageApp(pagename: string, cdnUrl: string) {
        if (!document.getElementById("app-root")) {
            throw new Error("Element with id 'app-root' not found.");
        }

        if (!window.PageSharedObject) {
            window.PageSharedObject = {};
        }

        if (window.__viteDev__) {
            injectViteDevScript(window.__viteDev__);
            injectScript(`${window.__viteDev__}@vite/client`);
            injectScript(`${window.__viteDev__}${pagename}/main.tsx`);
            return;
        }

        const baseUrl = `${cdnUrl}pages/`;
        $.getJSON(`${baseUrl}.vite/manifest.json`, (manifest: Record<string, IViteChunk>) => {
            const chunk = Object.values(manifest).find((chunk) => chunk.isEntry && chunk.name === pagename);

            if (!chunk) {
                throw new Error(`Entry chunk for ${pagename} not found.`);
            }

            chunk.css?.forEach((css: string) => {
                injectCss(`${baseUrl}${css}`);
            });
            injectScript(`${baseUrl}${chunk.file}`);
        });
    }

    window.PageAppLoaderUtil = PageAppLoaderUtil;
}
