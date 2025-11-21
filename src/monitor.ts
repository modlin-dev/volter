import { stdout } from "bun"
import { Redis } from "@upstash/redis"

export interface MonitorOptions {
	store?: Redis
	resolver?: (data: unknown) => unknown
}
export class Monitor {
	constructor(options?: MonitorOptions) {
		this.store = options?.store ?? Redis.fromEnv()
		this.resolver = options?.resolver ?? (data => JSON.stringify(data))
	}
	store: Redis
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
