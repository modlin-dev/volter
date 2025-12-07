import type { RedisClient } from "bun"

export declare interface MonitorOptions {
    store?: RedisClient,
    resolver?: (data: unknown) => unknown
}
export declare class Monitor {
    constructor(options?: MonitorOptions)
    store: RedisClient
    resolver: (data: unknown) => unknown
    log(data: unknown): Promise<void>
    resolve(resolver: (data: unknown) => unknown): void
}
