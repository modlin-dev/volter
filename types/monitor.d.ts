import type { Redis } from "@upstash/redis"

export declare interface MonitorOptions {
    store?: Redis,
    resolver?: (data: unknown) => unknown
}
export declare class Monitor {
    constructor(options?: MonitorOptions)
    store: Redis
    resolver: (data: unknown) => unknown
    log(data: unknown): Promise<void>
    resolve(resolver: (data: unknown) => unknown): void
}
