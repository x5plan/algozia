const fs = require("fs");
const CleanCSS = require("clean-css");

const src = "fonts/";
const dist = "dist/fonts/";
const cssDist = dist + "fonts.css";
const cssMinDist = dist + "fonts.min.css";

(function () {
    if (fs.existsSync(dist)) {
        fs.rmSync(dist, { recursive: true, force: true });
        fs.mkdirSync(dist);
    } else {
        fs.mkdirSync(dist, { recursive: true });
    }

    fs.cpSync(src, dist, { recursive: true });

    const css = fs.readFileSync(cssDist, "utf8");
    const minified = new CleanCSS().minify(css).styles;
    fs.writeFileSync(cssMinDist, minified);
})();
