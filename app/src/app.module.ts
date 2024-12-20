import { forwardRef, MiddlewareConsumer, Module, NestModule, RequestMethod } from "@nestjs/common";

import { AuthModule } from "@/auth/auth.module";
import { CodeLanguageModule } from "@/code-language/code-language.module";
import { ConfigModule } from "@/config/config.module";
import { ContestModule } from "@/contest/contest.module";
import { DatabaseModule } from "@/database/database.module";
import { FileModule } from "@/file/file.module";
import { HomeworkModule } from "@/homework/homework.module";
import { JudgeModule } from "@/judge/judge.module";
import { PermissionModule } from "@/permission/permission.module";
import { ProblemModule } from "@/problem/problem.module";
import { ProblemTypeModule } from "@/problem-type/problem-type.module";
import { RedisModule } from "@/redis/redis.module";
import { SubmissionModule } from "@/submission/submission.module";
import { UserModule } from "@/user/user.module";

import { AppController } from "./app.controller";
import { AppExceptionFilter } from "./app.filter";
import { AppMiddleware } from "./app.middleware";
import { AppService } from "./app.service";

@Module({
    imports: [
        ConfigModule,
        forwardRef(() => AuthModule),
        forwardRef(() => CodeLanguageModule),
        forwardRef(() => ContestModule),
        forwardRef(() => DatabaseModule),
        forwardRef(() => FileModule),
        forwardRef(() => HomeworkModule),
        forwardRef(() => JudgeModule),
        forwardRef(() => PermissionModule),
        forwardRef(() => ProblemModule),
        forwardRef(() => ProblemTypeModule),
        forwardRef(() => RedisModule),
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
