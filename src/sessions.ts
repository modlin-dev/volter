import { hash } from "./crypto"
import { createID, createPIN } from "./utils"
import { Resend, type CreateEmailOptions } from "resend"
import type { RedisClient } from "bun"

export interface SessionOptions {
	id: string
	token?: string
	ipaddress?: string
	useragent?: string
	expires: Date
	created: Date
}
export class Session {
	constructor(options?: SessionOptions) {
		this.id = options?.id ?? ""
		this.token = options?.token
		this.ipaddress = options?.ipaddress
		this.useragent = options?.useragent
		this.expires = options?.expires ?? new Date()
		this.created = options?.created ?? new Date()
	}

	id: string // user id
	token?: string
	ipaddress?: string
	useragent?: string

	expires: Date
	created: Date
}
export interface SessionPayload {
	token: string
	expires: Date
	created: Date
}

export class Sessions {
	constructor({
		store = Bun.redis,
		expiry = 2592000,
	}: {
		store?: RedisClient
		readonly expiry?: number
	} = {}) {
		this.store = store
		this.expiry = expiry
	}
	readonly store: RedisClient
	readonly expiry: number

	async validate(token: string): Promise<string | null> {
		return await this.store.get(`session:${hash(token)}`)
	} // validate
	async create(id: string): Promise<SessionPayload> {
		const session = createID()
		const lookup = hash(session)
		await this.store.set(`session:${lookup}`, id, "EX", this.expiry) // 30 days
		await this.store.sadd(`user:${id}:sessions`, lookup)
		const created = Date.now()
		const expires = created + this.expiry * 1000

		return {
			token: session,
			expires: new Date(expires),
			created: new Date(created),
		}
	} // create
	async find(token: string): Promise<Session | null> {
		if (await this.store.exists(`session:${token}`)) {
			const expires = Date.now() + (await this.store.ttl(`session:${token}`)) * 1000
			return new Session({
				id: (await this.store.get(`session:${token}`)) as string,
				expires: new Date(expires),
				created: new Date(expires - this.expiry * 1000),
			})
		}
		return null
	} // read
	async get(token: string): Promise<Session | null> {
		const lookup = hash(token)
		if (await this.store.exists(`session:${lookup}`)) {
			const expires = Date.now() + (await this.store.ttl(`session:${lookup}`)) * 1000
			return new Session({
				id: (await this.store.get(`session:${lookup}`)) as string,
				expires: new Date(expires),
				created: new Date(expires - this.expiry * 1000),
			})
		}
		return null
	} // read
	async list(id: string): Promise<Session[]> {
		const sessions = await this.store.smembers(`user:${id}:sessions`)
		const list: Session[] = []
		for (let i = 0; i < sessions.length; i++) {
			const lookup = sessions[i] as string
			if (await this.store.exists(`session:${lookup}`)) {
				const expires = Date.now() + (await this.store.ttl(`session:${lookup}`)) * 1000
				list.push(
					new Session({
						id: id,
						expires: new Date(expires),
						created: new Date(expires - this.expiry * 1000),
					}),
				)
			} else {
				await this.store.srem(`user:${id}:sessions`, lookup)
			}
		}
		return list
	} // read
	async rotate(token: string): Promise<SessionPayload | null> {
		const isValid = await this.validate(token)
		if (!isValid) return null
		await this.revoke(token)
		return this.create(token)
	} // update
	async revoke(token: string): Promise<void> {
		await this.store.del(`session:${hash(token)}`)
	} // delete
	async delete(token: string): Promise<void> {
		await this.store.del(`session:${token}`)
	} // delete
	async fallback(id: string) {
		const sessions = await this.store.smembers(`user:${id}:sessions`)
		for (let i = 0; i < sessions.length; i++) {
			await this.store.del(`session:${sessions[i]}`)
		}
		await this.store.del(`user:${id}:sessions`)
	} // delete
}

const resend = new Resend(Bun.env.RESEND_API_KEY)

export class e1T {
	constructor({
		store = Bun.redis, // storage bucket
		expiry = 60, // OTP expire time
		attempts = 5, // maximum failed attempts
		resend = new Resend(),
		template = (email, code) => ({
			from: "vID by Modlin <info@modlin.dev>",
			to: email,
			subject: `${code} is your verification code`,
			text: `${code} is your verification code. For your security, do not share this code.`,
		}),
	}: {
		store?: RedisClient
		expiry?: number
		attempts?: number
		resend?: Resend
		template?: (email: string, code: string) => CreateEmailOptions
	} = {}) {
		this.store = store
		this.expiry = expiry
		this.attempts = attempts
		this.resend = resend
		this.template = template
	}
	store: RedisClient
	expiry: number
	attempts: number
	resend: Resend
	template: (email: string, code: string) => CreateEmailOptions

	async create(email: string) {
		const code = createPIN()
		await this.store.set(`code:${email}`, hash(code), "EX", this.expiry)
		await this.store.set(`code.attempts:${email}`, "0", "EX", this.expiry)

		return {
			email,
			code,
			expires: new Date(Date.now() + this.expiry * 1000),
		}
	}

	async send(email: string) {
		const code = createPIN()
		await this.store.set(`code:${email}`, hash(code), "EX", this.expiry)
		await this.store.set(`code.attempts:${email}`, "0", "EX", this.expiry)

		await resend.emails.send(this.template(email, code))

		return {
			email,
			code,
			expires: new Date(Date.now() + this.expiry * 1000),
		}
	}
	async verify(email: string, code: string) {
		if (await this.store.exists(`code:${email}`)) {
			if ((await this.store.get(`code:${email}`)) === hash(code)) {
				await this.store.del(`code:${email}`)
				await this.store.del(`code.attempts:${email}`)
				return true
			}
			const n = await this.store.incr(`code.attempts:${email}`)
			if (n >= this.attempts) {
				await this.store.del(`code:${email}`)
				await this.store.del(`code.attempts:${email}`)
			}
			return false
		}
		return null
	}
	async delete(email: string) {
		if (await this.store.exists(`code:${email}`)) {
			await this.store.del(`code:${email}`)
			await this.store.del(`code.attempts:${email}`)
			return true
		}
		return null
	}
}
