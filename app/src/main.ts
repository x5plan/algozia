import { Logger, ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import type { NestExpressApplication as INestExpressApplication } from "@nestjs/platform-express";
import cookieParser from "cookie-parser";
import { json, urlencoded } from "express";
import { existsSync } from "fs";
import { join, resolve } from "path";

import { AppExceptionFilter } from "./app.filter";
import { AppModule } from "./app.module";
import { LOCAL_CDN_BASE } from "./common/const/cdn";
import { AppValidationException } from "./common/exceptions/common";
import { isProduction } from "./common/utils/env";
import { ConfigService } from "./config/config.service";

async function bootstrapAsync() {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const packageInfo = require("../package.json");

    Logger.log(`Starting ${packageInfo.name} version ${packageInfo.version}`, "App");

    const app = await NestFactory.create<INestExpressApplication>(AppModule, {
        bodyParser: false,
        logger: isProduction() ? ["warn", "error"] : ["log", "error", "warn", "debug", "verbose"],
    });

    const config = app.get(ConfigService).config;

    app.set("trust proxy", config.server.trustProxy);
    app.setBaseViewsDir(join(__dirname, "..", "views"));
    app.setViewEngine("pug");

    if (!config.cdnUrl) {
        const cdnPath = resolve(__dirname, "..", "..", "cdn", "dist");
        if (!existsSync(cdnPath)) {
            throw new Error(
                `CDN is not configured and the directory ${cdnPath} does not exist, ` +
                    'please configure cdnUrl or run "yarn bundle:prod" at the cdn directory',
            );
        }

        Logger.log(`CDN is not configured, serving static assets from ${cdnPath} to ${LOCAL_CDN_BASE}`, "App");

        app.useStaticAssets(cdnPath, {
            prefix: LOCAL_CDN_BASE,
            maxAge: isProduction() ? "1y" : 0,
        });
    }

    app.use(urlencoded({ extended: true, limit: "50mb" }));
    app.use(json({ limit: "50mb" }));
    app.use(cookieParser());
    app.useGlobalFilters(app.get(AppExceptionFilter));
    app.useGlobalPipes(
        new ValidationPipe({
            always: true,
            transform: true,
            whitelist: true,
            forbidNonWhitelisted: isProduction(),
            exceptionFactory: (errors) => new AppValidationException(errors),
        }),
    );

    await app.listen(config.server.port, config.server.hostname);

    Logger.log(`${packageInfo.name} is listening on ${config.server.hostname}:${config.server.port}`, "App");
}

bootstrapAsync().catch((e) => {
    Logger.error(e, "App");
});
