import { NestFactory } from "@nestjs/core";
import type { NestExpressApplication as INestExpressApplication } from "@nestjs/platform-express";
import { join } from "path";

import { AppModule } from "./app.module";

async function bootstrapAsync() {
    const app = await NestFactory.create<INestExpressApplication>(AppModule);
    app.setBaseViewsDir(join(__dirname, "..", "views"));
    app.setViewEngine("ejs");
    await app.listen(3000);
}

bootstrapAsync();
