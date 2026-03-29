import type { ServerError } from "./error"

export interface APIResponse {
	data?: unknown
	error?: ServerError[]
	success?: boolean
}

export type ID = number

export enum Method {
	GET,
	POST,
	PUT,
	DELETE,
	PATCH,
	HEAD,
	OPTIONS,
}

export enum Event {
    MESSAGE,
    OPEN,
    CLOSE,
    DRAIN,
}

export interface LogHTTP {
	id: ID
	method: Method // what?
	url: URL // where?
	status: number // why?
	ip: string // who?
	user_agent?: string
    size: number // how?
	created: Date // when?
}

export interface LogWS {
	id: ID
	event: Event // what?
	url: URL // where?
	ip: string // who?
	user_agent?: string
    size: number // how?
	created: Date // when?
}

export interface SocketConnection {
	id: ID
	ip: string
	created: Date
}
