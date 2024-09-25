import { forwardRef, MiddlewareConsumer, Module, NestModule, RequestMethod } from "@nestjs/common";

import { ConfigModule } from "@/config/config.module";
import { DatabaseModule } from "@/database/database.module";

import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { RedisModule } from "./redis/redis.module";
import { ViewMiddleware } from "./view.middleware";

@Module({
    imports: [ConfigModule, forwardRef(() => DatabaseModule), RedisModule],
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
