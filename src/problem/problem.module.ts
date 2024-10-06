import { forwardRef, MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { FileModule } from "@/file/file.module";
import { PermissionModule } from "@/permission/permission.module";
import { RedisModule } from "@/redis/redis.module";

import { ProblemController } from "./problem.controller";
import { ProblemEntity } from "./problem.entity";
import { ProblemMiddleware } from "./problem.middleware";
import { ProblemService } from "./problem.service";
import { ProblemFileEntity } from "./problem-file.entity";
import { ProblemJudgeInfoEntity } from "./problem-judge-info.entity";

@Module({
    imports: [
        TypeOrmModule.forFeature([ProblemEntity]),
        TypeOrmModule.forFeature([ProblemJudgeInfoEntity]),
        TypeOrmModule.forFeature([ProblemFileEntity]),
        forwardRef(() => PermissionModule),
        forwardRef(() => RedisModule),
        forwardRef(() => FileModule),
    ],
    controllers: [ProblemController],
    providers: [ProblemService],
    exports: [ProblemService],
})
export class ProblemModule implements NestModule {
    public configure(consumer: MiddlewareConsumer) {
        consumer.apply(ProblemMiddleware).forRoutes(ProblemController);
    }
}
