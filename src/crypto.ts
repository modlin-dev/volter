function toHex(bytes: Uint8Array): string {
	let hex = ""
	for (let i = 0; i < bytes.length; i++) {
		hex += (bytes[i] as number).toString(16).padStart(2, "0")
	}
	return hex
}

function fromHex(hex: string): Uint8Array<ArrayBuffer> {
	if (hex.length % 2 !== 0) throw new Error("Invalid hex string")
	const bytes = new Uint8Array(hex.length / 2)
	for (let i = 0; i < bytes.length; i++) {
		bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16)
	}
	return bytes
}

function toBase64(bytes: Uint8Array): string {
	let binary = ""
	for (let i = 0; i < bytes.length; i++) {
		binary += String.fromCharCode(bytes[i] as number)
	}
	return btoa(binary)
}

export function hashSync(password: string, hmac?: string): string {
	if (typeof Bun !== "undefined" && Bun.CryptoHasher) {
		const hasher = new Bun.CryptoHasher("sha256", hmac)
		return hasher.update(password).digest("hex")
	}
	throw new Error("hash() is synchronous and only available in Bun. Use hash_async() for WinterTC/Web Crypto compatibility.")
}
export async function hash(password: string): Promise<string> {
	const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(password))
	const bytes = new Uint8Array(digest)
	let hex = ""
	for (let i = 0; i < bytes.length; i++) {
		hex += bytes[i]?.toString(16).padStart(2, "0")
	}
	return hex
}

export interface CipherText {
	text: string
	iv: Uint8Array<ArrayBuffer>
	buffer: ArrayBuffer
}

export async function cryptoKey(raw?: CryptoKey | Uint8Array<ArrayBuffer> | string): Promise<CryptoKey> {
	if (raw) {
		if (raw instanceof CryptoKey) return raw
		let rawKey: Uint8Array<ArrayBuffer>
		if (raw instanceof Uint8Array) {
			rawKey = raw
		} else if (raw.length === 64) {
			rawKey = fromHex(raw)
		} else {
			rawKey = fromHex(await hash_async(raw))
		}
		return await crypto.subtle.importKey("raw", rawKey, { name: "AES-GCM", length: 256 }, true, ["encrypt", "decrypt"])
	}
	return await crypto.subtle.generateKey(
		{
			name: "AES-GCM",
			length: 256
		},
		true,
		["encrypt", "decrypt"]
	)
}

export async function exportKey(key: CryptoKey, format: "raw" | "pkcs8" | "spki") {
	const buffer = await crypto.subtle.exportKey(format, key)
	return toBase64(new Uint8Array(buffer))
}

export async function generateECDSAKeyPair(): Promise<CryptoKeyPair> {
	return await crypto.subtle.generateKey(
		{
			name: "ECDSA",
			namedCurve: "P-256" // SECG curve
		},
		true,
		["sign", "verify"]
	)
}

export async function exportJWK(key: CryptoKey): Promise<JsonWebKey> {
	return await crypto.subtle.exportKey("jwk", key)
}

export async function importJWK(jwk: JsonWebKey, usage: KeyUsage[]): Promise<CryptoKey> {
	return await crypto.subtle.importKey("jwk", jwk, { name: "ECDSA", namedCurve: "P-256" }, true, usage)
}

export async function sign(message: string, key: CryptoKey): Promise<Uint8Array<ArrayBuffer>> {
	const data = new TextEncoder().encode(message)

	const signature = await crypto.subtle.sign(
		{
			name: "ECDSA",
			hash: { name: "SHA-256" }
		},
		key,
		data
	)

	return new Uint8Array(signature)
}

export async function verifySign(message: string, signature: Uint8Array<ArrayBuffer>, key: CryptoKey): Promise<boolean> {
	const data = new TextEncoder().encode(message)

	return await crypto.subtle.verify(
		{
			name: "ECDSA",
			hash: { name: "SHA-256" }
		},
		key,
		signature,
		data
	)
}

export async function cipher(text: string, key: CryptoKey | string): Promise<CipherText> {
	const encoder = new TextEncoder()

	const data = encoder.encode(text)
	const iv = crypto.getRandomValues(new Uint8Array(12))
	const buffer = await crypto.subtle.encrypt({ name: "AES-GCM", iv: iv }, await cryptoKey(key), data)

	return {
		text: toHex(new Uint8Array(buffer)),
		iv: iv,
		buffer: buffer
	}
}

export async function decipher(input: CipherText, key: CryptoKey | string) {
	const decoder = new TextDecoder()

	const buffer = await crypto.subtle.decrypt({ name: "AES-GCM", iv: input.iv }, await cryptoKey(key), fromHex(input.text))

	const data = decoder.decode(buffer)

	return data
}

export async function keypair(): Promise<CryptoKeyPair> {
	return await crypto.subtle.generateKey(
		{
			name: "RSA-OAEP",
			modulusLength: 2048,
			publicExponent: new Uint8Array([0x01, 0x00, 0x01]), // 65537
			hash: { name: "SHA-256" }
		},
		true,
		["encrypt", "decrypt"]
	)
}

export async function encrypt(text: string, key: CryptoKey): Promise<Uint8Array<ArrayBuffer>> {
	const data = new TextEncoder().encode(text)
	const buffer = await crypto.subtle.encrypt({ name: "RSA-OAEP" }, key, data)
	return new Uint8Array(buffer)
}

export async function decrypt(text: Uint8Array<ArrayBuffer>, key: CryptoKey): Promise<string> {
	const buffer = await crypto.subtle.decrypt({ name: "RSA-OAEP" }, key, text)
	const data = new TextDecoder().decode(buffer)
	return data
}
