const packageConfig = require("../configs/packages.json");
const fs = require("fs");

const src = "node_modules/";
const dist = "dist/packages/";

function main() {
    if (fs.existsSync(dist)) {
        fs.rmSync(dist, { recursive: true, force: true });
        fs.mkdirSync(dist);
    } else {
        fs.mkdirSync(dist, { recursive: true });
    }

    for (const package in packageConfig) {
        const packagePath = packageConfig[package];
        const srcPath = src + packagePath;
        const distPath = dist + package;
        fs.cpSync(srcPath, distPath, { recursive: true });
    }
}

main();
