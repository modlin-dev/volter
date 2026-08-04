// import { init } from "@paralleldrive/cuid2"
import ansi from "ansi-colors"
import z from "zod"

declare global {
	interface Request {
		ip: Bun.SocketAddress
	}
	enum LogLevel {
		Info,
		Warn,
		Error,
		Fatal,
	}
	interface LogBase {
		level: LogLevel
		message: string
		created: Date
	}
}

export class Log implements LogBase {
	constructor(message: string) {
		this.level = LogLevel.Info
		this.message = message
		this.created = new Date()
	}
	level: LogLevel
	message: string
	created: Date
}

export const pin = z.string().min(6).max(6).regex(/\d{6}/)

export function createRandom(length = 32) {
	const bytes = crypto.getRandomValues(new Uint8Array(length))
	return bytes
}
// export const createID = init({ length: 32 })
export function createPIN(): string {
	const array = new Uint32Array(1)
	crypto.getRandomValues(array)
	return ((array[0] ?? 0) % 1000000).toString().padStart(6, "0")
}

export function timestamp(date?: Date): string {
	if (!date) date = new Date()
	return date.toISOString().slice(0, 19).replace("T", " ")
}

export let info = (...message: unknown[]) => {
	if (message[0] instanceof Date) {
		return console.info(ansi.gray(timestamp(message[0])), `${ansi.blue("info")}${ansi.dim(":")}`, ...message)
	}
	console.info(ansi.gray(timestamp()), `${ansi.blue("info")}${ansi.dim(":")}`, ...message)
}
export function log(...message: unknown[]) {
	if (message[0] instanceof Date) {
		return console.log(ansi.gray(timestamp(message[0])), ...message)
	}
	console.log(ansi.gray(timestamp()), ...message)
}
export function warn(...message: unknown[]) {
	if (message[0] instanceof Date) {
		return console.warn(ansi.gray(timestamp(message[0])), `${ansi.yellow("warn")}${ansi.dim(":")}`, ...message)
	}
	console.warn(ansi.gray(timestamp()), `${ansi.yellow("warn")}${ansi.dim(":")}`, ...message)
}
export function error(...message: unknown[]) {
	if (message[0] instanceof Date) {
		return console.error(ansi.gray(timestamp(message[0])), `${ansi.red("error")}${ansi.dim(":")}`, ...message)
	}
	console.error(ansi.gray(timestamp()), `${ansi.red("error")}${ansi.dim(":")}`, ...message)
}
export function fatal(...message: unknown[]) {
	if (message[0] instanceof Date) {
		return console.error(ansi.gray(timestamp(message[0])), `${ansi.magenta("fatal")}${ansi.dim(":")}`, ...message)
	}
	console.error(ansi.gray(timestamp()), `${ansi.magenta("fatal")}${ansi.dim(":")}`, ...message)
}
export function debug(...message: unknown[]) {
	if (message[0] instanceof Date) {
		return console.debug(ansi.yellow(timestamp(message[0])), ...message)
	}
	console.debug(ansi.yellow(timestamp()), ...message)
}

export async function input(prompt: string = ansi.dim("> ")) {
	await Bun.stdout.write(prompt)
	for await (const line of console) {
		console.log(line)
		return line
	}
}

export async function zip(data: Uint8Array<ArrayBuffer> | string | ArrayBuffer): Promise<Uint8Array<ArrayBuffer>> {
	const stream = new Blob([data]).stream().pipeThrough(new CompressionStream("gzip"))
	const buffer = await new Response(stream).arrayBuffer()
	return new Uint8Array(buffer)
}
export async function unzip(data: Uint8Array<ArrayBuffer> | string | ArrayBuffer): Promise<string> {
	const stream = new Blob([data]).stream().pipeThrough(new DecompressionStream("gzip"))
	return await new Response(stream).text()
}

export async function deflate(data: Uint8Array<ArrayBuffer> | string | ArrayBuffer): Promise<Uint8Array<ArrayBuffer>> {
	const stream = new Blob([data]).stream().pipeThrough(new CompressionStream("deflate"))
	const buffer = await new Response(stream).arrayBuffer()
	return new Uint8Array(buffer)
}
export async function inflate(data: Uint8Array<ArrayBuffer> | string | ArrayBuffer): Promise<string> {
	const stream = new Blob([data]).stream().pipeThrough(new DecompressionStream("deflate"))
	return await new Response(stream).text()
}

if (process.isBun) {
	if (Bun.env.NODE_ENV === "production") {
		info = () => {}
	}
}
