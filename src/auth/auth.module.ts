import { forwardRef, MiddlewareConsumer, Module, NestModule, RequestMethod } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { PermissionModule } from "@/permission/permission.module";
import { RedisModule } from "@/redis/redis.module";
import { UserModule } from "@/user/user.module";

import { AuthController } from "./auth.controller";
import { AuthEntity } from "./auth.entity";
import { AuthMiddleware } from "./auth.middleware";
import { AuthService } from "./auth.service";
import { AuthSessionService } from "./auth-session.service";

@Module({
    imports: [
        TypeOrmModule.forFeature([AuthEntity]),
        forwardRef(() => RedisModule),
        forwardRef(() => UserModule),
        forwardRef(() => PermissionModule),
    ],
    providers: [AuthService, AuthSessionService],
    exports: [AuthService, AuthSessionService],
    controllers: [AuthController],
})
export class AuthModule implements NestModule {
    public configure(consumer: MiddlewareConsumer): void {
        consumer.apply(AuthMiddleware).forRoutes({
            path: "*",
            method: RequestMethod.ALL,
        });
    }
}