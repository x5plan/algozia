import terser from "@rollup/plugin-terser";
import bundles from "./configs/bundles.mjs";

const buildSrc = "build/";
const bundleDist = "dist/bundle/";

export default bundles.map(({ src, dist }) => makeConfig(`${buildSrc}${src}`, `${bundleDist}${dist}`));

function makeConfig(input, output) {
    return {
        input: input,
        output: {
            file: output,
            format: "cjs",
            plugins: [terser()],
        },
    };
}
