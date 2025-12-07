import { stdout, type RedisClient } from "bun"

export interface MonitorOptions {
	store?: RedisClient
	resolver?: (data: unknown) => unknown
}
export class Monitor {
	constructor(options?: MonitorOptions) {
		this.store = options?.store ?? Bun.redis
		this.resolver = options?.resolver ?? (data => JSON.stringify(data))
	}
	store: RedisClient
	resolver: (data: unknown) => unknown

	async log(data: unknown) {
		const result = this.resolver(data)
		if (result) stdout.write(`${result}\n`)
		else stdout.write(`${JSON.stringify(data)}\n`)
	}
	resolve(resolver: (data: unknown) => unknown) {
		this.resolver = resolver
	}
}
