import ansi from "ansi-colors"
import z from "zod"
import { init } from "@paralleldrive/cuid2"

declare global {
	interface Request {
		ip: Bun.SocketAddress
	}
}

export const pin = z.string().min(6).max(6).regex(/\d{6}/)

export function createRandom(length = 32) {
	const bytes = crypto.getRandomValues(new Uint8Array(length))
	return bytes
}

export const createID = init({ length: 32 })
export function createPIN(): string {
	const array = new Uint32Array(1)
	crypto.getRandomValues(array)
	return ((array[0] ?? 0) % 1000000).toString().padStart(6, "0")
}

export function timestamp(date?: Date): string {
	if (!date) date = new Date()
	return date.toISOString().slice(0, 19).replace("T", " ")
}

export function log(...message: unknown[]) {
	console.log(ansi.gray(timestamp()), ...message)
}
export function error(...message: unknown[]) {
	console.error(ansi.red(timestamp()), ...message)
}
export function debug(...message: unknown[]) {
	console.log(ansi.gray(timestamp()), ...message)
}

export async function input(prompt: string = ansi.black("> ")) {
	await Bun.stdout.write(prompt)
	for await (const line of console) {
		return line
	}
}

export type HTTPLog = {
	timestamp: string
	method: string
	url: string
	ip: string
	request_id?: string
	service?: string
	level: "info" | "warn" | "error"
}

/**
 * Returns a structured JSON log of the request
 */
export function formatRequest(req: Request): HTTPLog {
	return {
		timestamp: new Date().toISOString(),
		method: req.method,
		url: new URL(req.url).pathname,
		ip: req.headers.get("x-forwarded-for") ?? "unknown",
		request_id: req.headers.get("x-request-id") ?? "none",
		service: "app",
		level: "info",
	}
}

/**
 * Returns a one-line pretty string with colors using chalk
 */
export function prettifyRequest(req: Request): string {
	const url = ansi.white(new URL(req.url).pathname)
	return `${ansi.gray(timestamp())} ${ansi.red(req.ip.address)} ${ansi.green(req.method)} ${url}`
}
