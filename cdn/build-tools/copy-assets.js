const fs = require("fs");
const CleanCSS = require("clean-css");

const src = "assets/";
const dist = "dist/assets/";

(function () {
    if (fs.existsSync(dist)) {
        fs.rmSync(dist, { recursive: true, force: true });
        fs.mkdirSync(dist);
    } else {
        fs.mkdirSync(dist, { recursive: true });
    }

    fs.cpSync(src, dist, { recursive: true });

    minifyCssFiles(dist);
})();

function minifyCssFiles(dir) {
    const files = fs.readdirSync(dir);
    return files.forEach((file) => {
        if (fs.statSync(`${dir}/${file}`).isDirectory()) {
            minifyCssFiles(`${dir}/${file}`);
        } else if (file.endsWith(".css")) {
            minifyCss(`${dir}/${file}`);
        }
    });
}

function minifyCss(path) {
    const css = fs.readFileSync(path, "utf-8");
    const minified = new CleanCSS().minify(css).styles;
    fs.writeFileSync(path, minified);
}