import { Logger, ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import type { NestExpressApplication as INestExpressApplication } from "@nestjs/platform-express";
import cookieParser from "cookie-parser";
import { json, urlencoded } from "express";
import { join } from "path";

import { AppExceptionFilter } from "./app.filter";
import { AppModule } from "./app.module";
import { AppValidationException } from "./common/exceptions/common.exception";
import { ConfigService } from "./config/config.service";

async function bootstrapAsync() {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const packageInfo = require("../package.json");

    Logger.log(`Starting ${packageInfo.name} version ${packageInfo.version}`, "Bootstrap");

    const app = await NestFactory.create<INestExpressApplication>(AppModule, {
        bodyParser: false,
    });

    app.setBaseViewsDir(join(__dirname, "..", "views"));
    app.setViewEngine("pug");
    app.use(urlencoded({ extended: true, limit: "50mb" }));
    app.use(json({ limit: "50mb" }));
    app.use(cookieParser());

    app.useGlobalFilters(app.get(AppExceptionFilter));
    app.useGlobalPipes(
        new ValidationPipe({
            always: true,
            transform: true,
            whitelist: true,
            forbidNonWhitelisted: true,
            exceptionFactory: (errors) => new AppValidationException(errors),
        }),
    );

    const config = app.get(ConfigService).config;

    await app.listen(config.server.port, config.server.hostname);

    Logger.log(`${packageInfo.name} is listening on ${config.server.hostname}:${config.server.port}`, "Bootstrap");
}

bootstrapAsync().catch((e) => {
    Logger.error(e, "App");
});
