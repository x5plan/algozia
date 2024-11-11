import { defineConfig } from "vite";
import preact from "@preact/preset-vite";
import pages from "./configs/pages.json";
import path from "path";

const pagesConfig = Object.fromEntries(pages.map((page) => [page, `/${page}/main.tsx`]));

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [preact()],
    root: "./pages",
    base: "./",
    resolve: {
        alias: {
            "<Shared>": path.resolve(__dirname, "pages", "shared"),
        },
    },
    server: {
        port: 5173,
        cors: true,
        strictPort: true,
    },
    build: {
        minify: "terser",
        manifest: true,
        outDir: "../dist/pages",
        emptyOutDir: true,
        rollupOptions: {
            input: pagesConfig,
            output: {
                entryFileNames: "[name].[hash].js",
                chunkFileNames: "assets/[name].[hash].js",
                assetFileNames: "assets/[name].[hash][extname]",
            },
        },
    },
});
