import type { Resend, CreateEmailOptions } from "resend"
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
	constructor(options?: SessionOptions)
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
	constructor(options?: {
		store?: RedisClient
		readonly expiry?: number
	})
	readonly store: RedisClient
	readonly expiry: number

	validate(token: string): Promise<string | null>
	create(id: string): Promise<SessionPayload>
	get(token: string | Session): Promise<Session | null>
	list(id: string): Promise<Session[]>
	rotate(token: string): Promise<SessionPayload | null>
	revoke(token: string): Promise<void>
	delete(token: string): Promise<void>
	fallback(id: string): Promise<void>
}

export class e1T {
	constructor(options?: {
		store?: RedisClient
		expiry?: number
		attempts?: number
		resend?: Resend
		template?: (email: string, code: string) => CreateEmailOptions
	})
	store: RedisClient
	expiry: number
	attempts: number
	resend: Resend
	template: (email: string, code: string) => CreateEmailOptions

	create(email: string): Promise<{
		email: string
		code: string
		expires: Date
	}>
	send(email: string): Promise<{
		email: string
		code: string
		expires: Date
	}>
	verify(email: string, code: string): Promise<boolean | null>
	delete(email: string): Promise<boolean | null>
}
