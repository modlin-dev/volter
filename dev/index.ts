import type { RedisClient, SocketAddress } from "bun"

declare global {
	interface Request {
		ip: SocketAddress
	}
}

export namespace Volter {
	export namespace Cache {
		export interface Options {
			expiry?: number
			limit?: number
			/** FIFO */
			max?: number
		}
		export interface KV {
			value: string
			getch: number
			expiry?: NodeJS.Timeout
			limit?: number
		}
	}
	export class Cache {
		constructor(options?: Cache.Options) {
			this.expiry = options?.expiry
			this.limit = options?.limit
			this.max = options?.max
		}
		expiry?: number
		limit?: number
		max?: number
		hasher = new Bun.CryptoHasher("sha256")
		store: { [x: string]: Cache.KV } = {}
		hash(password: string): string {
			return this.hasher.update(password).digest("base64")
		}
		pop(): void {
			const keys = Object.keys(this.store)
			delete this.store[keys[keys.length - 1] ?? ""]
		}
		has(key: string): boolean {
			return this.store[key] !== undefined
		}
		get(key: string): string | null {
			if (this.store[key] !== undefined) {
				const record = this.store[key]
				this.store[key].getch += 1
				if (record.limit !== undefined) {
					if (record.getch >= record.limit) {
						delete this.store[key]
						return null
					}
				}
				return record.value
			}
			return null
		}
		set(key: string, value: string, expiry?: number, limit?: number): boolean {
			if (this.max !== undefined && this.size() >= this.max) this.pop()
			this.store[key] = {
				value,
				getch: 0,
				limit: limit ?? this.limit,
				expiry: expiry
					? setTimeout(() => delete this.store[key], expiry * 1000)
					: this.expiry
						? setTimeout(() => delete this.store[key], this.expiry * 1000)
						: undefined,
			}
			return true
		}
		del(key: string): boolean {
			if (this.store[key]) {
				if (this.store[key].expiry !== undefined) {
					clearTimeout(this.store[key].expiry)
				} else {
					delete this.store[key]
				}
				return true
			}
			return false
		}
		clear(): void {
			this.store = {}
		}
		size(): number {
			return Object.keys(this.store).length
		}
	}

	export interface RatelimitOptions {
		redis: RedisClient
		limit: number
		duration: number
		max: number
	}
	export interface RatelimitResult {
		success: boolean
		remaining: number
	}

	export class Ratelimit {
		private redis: RedisClient
		private limiter: number
		private duration: number
		private max: number

		constructor(options: RatelimitOptions) {
			this.redis = options.redis
			this.limiter = options.limit
			this.duration = options.duration
			this.max = options.max
		}

		async limit(identifier: string): Promise<RatelimitResult> {
			const blocked = await this.redis.exists(`ratelimited:${identifier}`)
			if (blocked) {
				return {
					success: false,
					remaining: 0,
				}
			}

			const key = `ratelimit:${identifier}`

			const count = await this.redis.incr(key)
			if (count === 1) {
				await this.redis.expire(key, this.duration)
			}

			if (count >= this.max) {
				await this.redis.set(`ratelimited:${identifier}`, "1")
				await this.redis.expire(`ratelimited:${identifier}`, this.limiter)
			}

			return {
				success: true,
				remaining: this.max - count,
			}
		}
	}
}

export default Volter
