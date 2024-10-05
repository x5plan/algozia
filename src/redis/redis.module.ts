import { Module } from "@nestjs/common";

import { LockService } from "./lock.service";
import { RedisService } from "./redis.service";

@Module({
    providers: [RedisService, LockService],
    exports: [RedisService, LockService],
})
export class RedisModule {}
