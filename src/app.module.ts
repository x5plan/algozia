import { MiddlewareConsumer, Module, NestModule, RequestMethod } from "@nestjs/common";

import { ConfigModule } from "@/config/config.module";

import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { ViewMiddleware } from "./view.middleware";

@Module({
    imports: [ConfigModule],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule implements NestModule {
    public configure(consumer: MiddlewareConsumer) {
        consumer.apply(ViewMiddleware).forRoutes({
            path: "*",
            method: RequestMethod.ALL,
        });
    }
}
