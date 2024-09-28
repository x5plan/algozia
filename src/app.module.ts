import { forwardRef, MiddlewareConsumer, Module, NestModule, RequestMethod } from "@nestjs/common";

import { AuthModule } from "@/auth/auth.module";
import { ConfigModule } from "@/config/config.module";
import { ContestModule } from "@/contest/contest.module";
import { DatabaseModule } from "@/database/database.module";
import { HomeworkModule } from "@/homework/homework.module";
import { PermissionModule } from "@/permission/permission.module";
import { ProblemModule } from "@/problem/problem.module";
import { RedisModule } from "@/redis/redis.module";
import { SubmissionModule } from "@/submission/submission.module";
import { UserModule } from "@/user/user.module";

import { AppController } from "./app.controller";
import { AppExceptionFilter } from "./app.filter";
import { AppMiddleware } from "./app.middleware";
import { AppService } from "./app.service";

@Module({
    imports: [
        // Global modules
        ConfigModule,
        forwardRef(() => DatabaseModule),
        forwardRef(() => RedisModule),

        // Feature modules
        forwardRef(() => AuthModule),
        forwardRef(() => ContestModule),
        forwardRef(() => HomeworkModule),
        forwardRef(() => PermissionModule),
        forwardRef(() => ProblemModule),
        forwardRef(() => SubmissionModule),
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
