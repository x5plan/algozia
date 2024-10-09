import type { OnModuleInit } from "@nestjs/common";
import { Injectable } from "@nestjs/common";
import Redis from "ioredis";

import { ConfigService } from "@/config/config.service";

const REDIS_CACHE_EXPIRE_TIME = 60 * 60 * 24 * 30; // 7 days

@Injectable()
export class RedisService implements OnModuleInit {
    private readonly client: Redis;
    private readonly untilReadyPromise: Promise<void>;

    constructor(private readonly configService: ConfigService) {
        this.client = new Redis(this.configService.config.redis, {
            enableReadyCheck: true,
        });

        this.untilReadyPromise = new Promise((resolve, reject) => {
            this.client.once("ready", resolve);
            this.client.once("error", reject);
        });
    }

    // eslint-disable-next-line @typescript-eslint/naming-convention
    public async onModuleInit(): Promise<void> {
        try {
            await this.untilReadyPromise;
        } catch (e) {
            throw new Error(`Could not connect to Redis service: ${e}`);
        }
    }

    public async cacheSetAsync(key: string, value: string): Promise<void> {
        await this.client.setex(key, REDIS_CACHE_EXPIRE_TIME, value);
    }

    public async cacheGetAsync(key: string): Promise<string | null> {
        return await this.client.get(key);
    }

    public async cacheDeleteAsync(key: string): Promise<void> {
        await this.client.del(key);
    }

    public getClient(): Redis {
        return this.client.duplicate();
    }
}
