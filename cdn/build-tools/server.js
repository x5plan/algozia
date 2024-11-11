const http = require("http");
const fs = require("fs");
const path = require("path");

const port = 5288;
const publicDirectory = path.join(__dirname, "..", "dist");

const server = http.createServer((req, res) => {
    if (req.method !== "GET") {
        res.writeHead(405).end("405 Method Not Allowed");
        return;
    }

    const filePath = path.join(publicDirectory, req.url === "/" ? "index.html" : req.url);
    const extname = path.extname(filePath);

    fs.readFile(filePath, (error, content) => {
        if (error) {
            if (error.code === "ENOENT") {
                res.writeHead(404).end("404 Not Found");
            } else {
                res.writeHead(500).end(`Server Error: ${error.code}`);
            }
        } else {
            res.writeHead(200, {
                "Content-Type": getContentType(extname),
                "Access-Control-Allow-Origin": "*",
            });
            res.end(content);
        }
    });
});

function getContentType(extname) {
    switch (extname) {
        case ".js":
            return "text/javascript";
        case ".css":
            return "text/css";
        case ".json":
            return "application/json";
        case ".png":
            return "image/png";
        case ".jpg":
            return "image/jpg";
        case ".svg":
            return "image/svg+xml";
        case ".wav":
            return "audio/wav";
        case ".html":
            return "text/html";
        default:
            return "text/plain";
    }
}

server.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
