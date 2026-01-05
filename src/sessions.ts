import { hash } from "./crypto"
import { createID, createPIN } from "./utils"
import { Resend, type CreateEmailOptions } from "resend"
import type { RedisClient } from "bun"
import { ErrorCodes, ServerError } from "./error"

export interface SessionOptions {
	id: string
	token?: string
	ipaddress?: string
	useragent?: string
	expires: Date
	created?: Date
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
	id: string
	token: string
	ipaddress?: string
	useragent?: string

	expires: Date
	created: Date
}

export class Sessions {
	constructor(options?: {
		store?: RedisClient
		expiry?: number
		createID?: () => string | Promise<string>
	}) {
		this.store = options?.store ?? Bun.redis
		this.expiry = options?.expiry ?? 2592000
		this.createID = options?.createID ?? createID
	}
	store: RedisClient
	expiry: number
	createID: () => string | Promise<string>

	async validate(token: string): Promise<string | null> {
		return await this.store.get(`session:${hash(token)}`)
	} // validate

	async create(id: string): Promise<SessionPayload> {
		const token = await this.createID()
		const lookup = hash(token)
		await this.store.set(`session:${lookup}`, id, "EX", this.expiry) // 30 days
		await this.store.sadd(`user:${id}:sessions`, lookup)
		const created = Date.now()
		const expires = created + this.expiry * 1000

		return {
			id: id,
			token: token,
			expires: new Date(expires),
			created: new Date(created),
		}
	} // create

	async get(token: string): Promise<Session> {
		const lookup = hash(token)
		const id = await this.store.get(`session:${lookup}`)
		if (id) {
			const expires = Date.now() + (await this.store.ttl(`session:${lookup}`)) * 1000
			return new Session({
				id: id,
				expires: new Date(expires),
				created: new Date(expires - this.expiry * 1000),
			})
		}
		throw new ServerError("Session not found", {
			code: ErrorCodes.INVALID_TOKEN,
		})
	} // read

	async info(token: string): Promise<Session> {
		const lookup = hash(token)
		const id = await this.store.get(`session:${lookup}`)
		if (id) {
			const expires = Date.now() + (await this.store.ttl(`session:${lookup}`)) * 1000
			return new Session({
				id: id,
				token: token, // !warn
				expires: new Date(expires),
				created: new Date(expires - this.expiry * 1000),
			})
		}
		throw new ServerError("Session not found", {
			code: ErrorCodes.INVALID_TOKEN,
		})
	}

	async safeGet(token: string): Promise<Session | null> {
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
	async revoke(token: string): Promise<number> {
		return await this.store.del(`session:${hash(token)}`)
	} // delete
	/** if user is authenticated with another session and want to delete previous sessions */
	async delete(token: string, session: Session): Promise<number | null> {
		if (session.id === (await this.store.get(`session:${token}`))) {
			return await this.store.del(`session:${token}`)
		}
		return null
	} // delete

	async fallback(token: string) {
		const lookup = hash(token)
		const userId = await this.store.get(`session:${lookup}`)
		if (!userId) return

		const sessions = await this.store.smembers(`user:${userId}:sessions`)

		for (let i = 0; i < sessions.length; i++) {
			const sessionLookup = sessions[i] as string
			// Skip the current session, delete all others
			if (sessionLookup !== lookup) {
				await this.store.del(`session:${sessionLookup}`)
			}
		}

		// Update the user's sessions set to only include current session
		await this.store.del(`user:${userId}:sessions`)
		await this.store.sadd(`user:${userId}:sessions`, lookup)
	} // delete
}

export class e1T {
	constructor(options?: {
		store?: RedisClient
		expiry?: number
		attempts?: number
		resend?: Resend
		template?: (email: string, code: string) => CreateEmailOptions
	}) {
		this.store = options?.store ?? Bun.redis
		this.expiry = options?.expiry ?? 60
		this.attempts = options?.attempts ?? 5
		this.resend = options?.resend ?? new Resend()
		this.template =
			options?.template ??
			((email, code) => ({
				from: "vID by Modlin <info@modlin.dev>",
				to: email,
				subject: `${code} is your verification code`,
				text: `${code} is your verification code. For your security, do not share this code.`,
			}))
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

		await this.resend.emails.send(this.template(email, code))

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
	async everify(email: string, code: string) {
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
			throw new ServerError("Invalid code")
		}
		throw new ServerError("Access denied", {
			code: ErrorCodes.SERVICE_UNAVAILABLE,
		})
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
