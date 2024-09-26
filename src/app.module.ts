import { forwardRef, MiddlewareConsumer, Module, NestModule, RequestMethod } from "@nestjs/common";

import { AuthModule } from "@/auth/auth.module";
import { ConfigModule } from "@/config/config.module";
import { DatabaseModule } from "@/database/database.module";
import { RedisModule } from "@/redis/redis.module";
import { UserModule } from "@/user/user.module";

import { AppController } from "./app.controller";
import { AppExceptionFilter } from "./app.filter";
import { AppMiddleware } from "./app.middleware";
import { AppService } from "./app.service";

@Module({
    imports: [
        // Global modules
        ConfigModule,

        // Feature modules
        forwardRef(() => AuthModule),
        forwardRef(() => DatabaseModule),
        forwardRef(() => RedisModule),
        forwardRef(() => UserModule),
    ],
    controllers: [AppController],
    providers: [AppService, AppExceptionFilter],
})
export class AppModule implements NestModule {
    public configure(consumer: MiddlewareConsumer) {
        consumer.apply(AppMiddleware).forRoutes({
            path: "*",
            method: RequestMethod.ALL,
        });
    }
}
