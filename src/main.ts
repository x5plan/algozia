import { Logger } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import type { NestExpressApplication as INestExpressApplication } from "@nestjs/platform-express";
import { json as expressJson } from "express";
import { join } from "path";

import { AppModule } from "./app.module";
import { ConfigService } from "./config/config.service";

async function bootstrapAsync() {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const packageInfo = require("../package.json");

    Logger.log(`Starting ${packageInfo.name} version ${packageInfo.version}`, "Bootstrap");

    const app = await NestFactory.create<INestExpressApplication>(AppModule);

    app.setBaseViewsDir(join(__dirname, "..", "views"));
    app.setViewEngine("pug");
    app.use(expressJson({ limit: "50mb" }));

    const config = app.get(ConfigService).config;

    await app.listen(config.server.port, config.server.hostname);

    Logger.log(`${packageInfo.name} is listening on ${config.server.hostname}:${config.server.port}`, "Bootstrap");
}

bootstrapAsync().catch((e) => {
    Logger.error(e, "App");
});
