import terser from "@rollup/plugin-terser";
import bundles from "./configs/bundles.mjs";

const buildSrc = "build/";
const bundleDist = "dist/bundle/";

export default bundles.map(({ src, dist }) => makeConfig(`${buildSrc}${src}`, `${bundleDist}${dist}`)).flat(1);

function makeConfig(input, output) {
    return [
        {
            input: input + ".js",
            output: {
                file: output + ".js",
                format: "cjs",
            },
        },
        {
            input: input + ".js",
            output: {
                file: output + ".min.js",
                format: "cjs",
                plugins: [terser()],
            },
        },
    ];
}
