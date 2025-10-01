import { privateDecrypt, publicEncrypt, randomInt } from "node:crypto"
import os from "node:os"
import chalk from "chalk"
import cuid2 from "@paralleldrive/cuid2"
import { generateKeyPairSync } from "node:crypto"
import z from "zod"
import type { SocketAddress } from "node:net"

declare global {
	interface Request {
		ip: SocketAddress
	}
}

export const pin = z.string().min(6).max(6).regex(/\d{6}/)

export function createPIN(): string {
	return randomInt(0, 1000000).toString().padStart(6, "0")
}
export const createID = cuid2.init({ length: 32 })

export function hash(password: string): string {
	const hasher = new Bun.CryptoHasher("sha256")
	return hasher.update(password).digest("hex")
}

export function timestamp(): string
export function timestamp(date: Date): string
export function timestamp(date?: Date): string {
	if (!date) date = new Date()
	return date.toISOString().slice(0, 19).replace("T", " ")
}

export function log(...message: unknown[]) {
	console.log(chalk.gray(timestamp()), ...message)
}
export function error(...message: unknown[]) {
	console.error(chalk.red(timestamp()), ...message)
}

export async function input(prompt: string = chalk.black("> ")) {
	await Bun.stdout.write(prompt)
	for await (const line of console) {
		return line
	}
}

export type HTTPLog = {
	timestamp: string
	method: string
	url: string
	IP: string
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
		IP: req.headers.get("x-forwarded-for") ?? "unknown",
		request_id: req.headers.get("x-request-id") ?? "none",
		service: "app",
		level: "info",
	}
}

/**
 * Returns a one-line pretty string with colors using chalk
 */
export function prettifyRequest(req: Request): string {
	const url = chalk.white(new URL(req.url).pathname)
	return `${chalk.gray(timestamp())} ${chalk.red(req.ip.address)} ${chalk.green(req.method)} ${url}`
}

interface Adapter {
	adapter: string
	networks: Bun.SocketAddress[]
}

export function listAdapters(): Adapter[] {
	const interfaces = os.networkInterfaces()
	const results: Adapter[] = []

	for (const [name, infos] of Object.entries(interfaces)) {
		if (!infos) continue

		const networks: Bun.SocketAddress[] = []

		for (const info of infos) {
			if (!info.address) continue

			networks.push({
				address: info.address,
				family: info.family,
				port: 0,
			})
		}

		results.push({
			adapter: name,
			networks,
		})
	}

	return results
}

type KeyPair = {
	public: string
	private: string
}

export async function key(): Promise<KeyPair> {
	const { publicKey, privateKey } = generateKeyPairSync("rsa", {
		modulusLength: 2048,
		publicKeyEncoding: {
			type: "spki",
			format: "pem",
		},
		privateKeyEncoding: {
			type: "pkcs8",
			format: "pem",
		},
	})

	return {
		public: publicKey,
		private: privateKey,
	}
}

export function encrypt(key: string, data: string) {
	const buffer = Buffer.from(data, "utf-8")
	const encrypted = publicEncrypt(key, buffer)
	return encrypted.toString("hex")
}

export function decrypt(key: string, encrypted: string) {
	const buffer = Buffer.from(encrypted, "hex")
	const decrypted = privateDecrypt(key, buffer)
	return decrypted.toString("utf-8")
}
