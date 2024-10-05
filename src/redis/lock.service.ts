import { Injectable } from "@nestjs/common";
import { readFileSync } from "fs";
import { join } from "path";
import { v4 as uuidv4 } from "uuid";

import { format } from "@/common/utils/format";
import { sleepAsync } from "@/common/utils/sleep";

import { CE_LockType, IRedisWithLock } from "./lock.type";
import { RedisService } from "./redis.service";

const LOCK_TTL = 5000;
const LOCK_TTL_RESET_INTERVAL = LOCK_TTL * 0.5;
const LOCK_RETRY_DELAY = 1000;
const LOCK_MAX_RETRY = 30;

const REDIS_KEY_RWLOCK_WRITE_INTENT = "rwlock:{0}:write-intent";
const REDIS_KEY_RWLOCK_WRITE_LOCK = "rwlock:{0}:write-lock";
const REDIS_KEY_RWLOCK_READERS = "rwlock:{0}:readers";

@Injectable()
export class LockService {
    private redis: IRedisWithLock;

    constructor(private readonly redisService: RedisService) {
        this.redis = this.redisService.getClient() as IRedisWithLock;
        this.redis.defineCommand("callLock", {
            numberOfKeys: 1,
            lua: readFileSync(join(__dirname, "scripts", "lock.lua")).toString("utf-8"),
        });
        this.redis.defineCommand("callReadWriteLock", {
            numberOfKeys: 3,
            lua: readFileSync(join(__dirname, "scripts", "read-write-lock.lua")).toString("utf-8"),
        });
    }

    /**
     * `doUnlockAsync` and `doRefreshAsync` returns `false` when there's a lock-refresh failure
     */
    private async internalLockAsync<T>(
        name: string,
        doLockAsync: () => Promise<boolean>,
        doUnlockAsync: () => Promise<boolean>,
        doRefreshAsync: () => Promise<boolean>,
        callbackAsync: () => Promise<T>,
    ): Promise<T> {
        // Try locking
        let retries = 0;

        while (!(await doLockAsync())) {
            if (++retries === LOCK_MAX_RETRY) {
                throw new Error(`Retries limit exceeded while attempting to lock ${JSON.stringify(name)}`);
            }
            await sleepAsync(LOCK_RETRY_DELAY);
        }

        // If the locked lock token mismatch, means the lock expired while this node hold the lock
        // This is a dangerous situation
        const onLockTokenMismatch = () => {
            throw new Error(`Lock refresh failure detected on ${JSON.stringify(name)}, is the system overloaded?`);
        };

        let unlocked = false;
        // Use a timer to refresh the lock's TTL
        let refreshTimer: ReturnType<typeof setTimeout>;
        const setRefreshTimer = () => {
            refreshTimer = setTimeout(refreshLockExpire, LOCK_TTL_RESET_INTERVAL);
        };

        const refreshLockExpire = async () => {
            if (!(await doRefreshAsync())) {
                onLockTokenMismatch();
                return;
            }

            // `unlock` may be called during the `await` above, so if that happens do not set the timer
            if (!unlocked) setRefreshTimer();
        };

        const unlockAsync = async () => {
            if (unlocked) return;
            unlocked = true;

            clearTimeout(refreshTimer);

            if (!(await doUnlockAsync())) {
                onLockTokenMismatch();
            }
        };

        setRefreshTimer();

        try {
            return await callbackAsync();
        } finally {
            await unlockAsync();
        }
    }

    /**
     * Basic lock with Redis.
     * @param name The lock name.
     * @param callbackAsync The function to execute while the lock is held.
     * @return The value returned in `callback`.
     */
    public async lockAsync<T>(name: string, callbackAsync: () => Promise<T>): Promise<T> {
        // Generate a unique lock token
        const lockToken = uuidv4();

        return await this.internalLockAsync(
            name,
            () => this.redis.callLock(name, "lock", lockToken, LOCK_TTL),
            () => this.redis.callLock(name, "unlock", lockToken),
            () => this.redis.callLock(name, "refresh", lockToken, LOCK_TTL),
            callbackAsync,
        );
    }

    /**
     * Lock a read-write-lock for a reader or writer.
     * Multiple readers can hold the same lock at the same time with no writer.
     * Only one writer can hold the same lock at the same time with no reader.
     * @param name The lock name.
     * @param type The operation type, read or wirte.
     * @param callbackAsync The function to execute while the lock is held.
     * @return The value returned in `callback`.
     */
    public async lockReadWriteAsync<T>(name: string, type: CE_LockType, callbackAsync: () => Promise<T>): Promise<T> {
        const keys = [
            format(REDIS_KEY_RWLOCK_WRITE_INTENT, name),
            format(REDIS_KEY_RWLOCK_WRITE_LOCK, name),
            format(REDIS_KEY_RWLOCK_READERS, name),
        ] as const;

        if (type === CE_LockType.Read) {
            return await this.internalLockAsync(
                `Read(${name})`,
                () => this.redis.callReadWriteLock(...keys, "read_lock", LOCK_TTL),
                () => this.redis.callReadWriteLock(...keys, "read_unlock"),
                () => this.redis.callReadWriteLock(...keys, "read_refresh", LOCK_TTL),
                callbackAsync,
            );
        } else if (type === CE_LockType.Write) {
            const lockToken = uuidv4();

            return await this.internalLockAsync(
                `Write(${name})`,
                () => this.redis.callReadWriteLock(...keys, "write_lock", lockToken, LOCK_TTL),
                () => this.redis.callReadWriteLock(...keys, "write_unlock", lockToken),
                () => this.redis.callReadWriteLock(...keys, "write_refresh", lockToken, LOCK_TTL),
                callbackAsync,
            );
        } else {
            throw new Error(`Invalid lock type: ${type}`);
        }
    }
}
