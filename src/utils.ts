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

export function info(...message: unknown[]) {
	console.log(`${ansi.blue("info")}${ansi.dim(":")}`, ...message)
}
export function log(...message: unknown[]) {
	console.log(ansi.dim(timestamp()), ...message)
}
export function error(...message: unknown[]) {
	console.error(ansi.red(timestamp()), ...message)
}
export function debug(...message: unknown[]) {
	console.debug(ansi.yellow(timestamp()), ...message)
}
export function warn(...message: unknown[]) {
	console.warn(ansi.yellow(timestamp()), ...message)
}

export async function input(prompt: string = ansi.dim("> ")) {
	await Bun.stdout.write(prompt)
	for await (const line of console) {
		console.log(line)
		return line
	}
}

export function zip(text: string): Uint8Array<ArrayBuffer> {
	return Bun.gzipSync(text)
}
export function unzip(zipped: Uint8Array<ArrayBuffer>): string {
	return new TextDecoder().decode(Bun.gunzipSync(zipped))
}
