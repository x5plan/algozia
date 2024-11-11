import type Redis from "ioredis";

export const enum CE_LockType {
    Read = "read",
    Write = "write",
}

export interface IRedisWithLock extends Redis {
    // Refer to scripts/lock.lua for details.
    callLock(key: string, command: "lock" | "refresh", token: string, ttl: number): Promise<boolean>;
    callLock(key: string, command: "unlock", token: string): Promise<boolean>;

    // Refer to scripts/read-write-lock.lua for details.
    callReadWriteLock(key1: string, key2: string, key3: string, command: "read_unlock"): Promise<boolean>;
    callReadWriteLock(
        key1: string,
        key2: string,
        key3: string,
        command: "read_lock" | "read_refresh",
        ttl: number,
    ): Promise<boolean>;
    callReadWriteLock(
        key1: string,
        key2: string,
        key3: string,
        command: "write_unlock",
        token: string,
    ): Promise<boolean>;
    callReadWriteLock(
        key1: string,
        key2: string,
        key3: string,
        command: "write_lock" | "write_refresh",
        token: string,
        ttl: number,
    ): Promise<boolean>;
}
