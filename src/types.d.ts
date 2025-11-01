declare module "volter/utils" {
	export function createPIN(): string
	export function createID(): string

	export function timestamp(date?: Date): string

	export function log(...message: unknown[]): void
	export function error(...message: unknown[]): void
	export function debug(...message: unknown[]): void

	export function input(prompt?: string): string

	export function prettifyRequest(request: Request): string
}

declare module "volter/crypto" {
	export interface CipherText {
		text: string
		iv: Uint8Array<ArrayBuffer>
		buffer: ArrayBuffer
	}

	export function hash(password: string, hmac?: string): string

	export function key(raw?: CryptoKey | Uint8Array<ArrayBuffer> | string): Promise<CryptoKey>
	export function exportKey(key: CryptoKey, format: "raw" | "spki" | "pkcs8"): Promise<string>

	export function cipher(text: string, key: CryptoKey | string): Promise<CipherText>
	export function decipher(cipher: CipherText, key: CryptoKey | string): Promise<string>

	export function keypair(): Promise<CryptoKeyPair>
	export function encrypt(text: string, key: CryptoKey): Promise<Uint8Array<ArrayBuffer>>
	export function decrypt(text: Uint8Array<ArrayBuffer>, key: CryptoKey): Promise<string>

	export function sign(message: string, key: CryptoKey): Promise<Uint8Array<ArrayBuffer>>
	export function verifySign(message: string, signature: Uint8Array<ArrayBuffer>, key: CryptoKey): Promise<boolean>
}
