export function hash(password: string, hmac?: string): string {
	const hasher = new Bun.CryptoHasher("sha256", hmac)
	return hasher.update(password).digest("hex")
}
export async function hash_async(password: string): Promise<string> {
    const encoded = new TextEncoder().encode(password)
    const hashBuffer = await crypto.subtle.digest("SHA-256", encoded)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, "0")).join("")
}

export interface CipherText {
	text: string
	iv: Uint8Array<ArrayBuffer>
	buffer: ArrayBuffer
}

export async function cryptoKey(raw?: CryptoKey | Uint8Array<ArrayBuffer> | string): Promise<CryptoKey> {
	if (raw) {
		if (raw instanceof CryptoKey) return raw
		if (raw instanceof Uint8Array) {
			if (raw.length === 32) {
				return await crypto.subtle.importKey("raw", raw, { name: "AES-GCM", length: 256 }, true, ["encrypt", "decrypt"])
			}
			return await crypto.subtle.importKey("raw", raw, { name: "AES-GCM", length: 256 }, true, ["encrypt", "decrypt"])
		}
		if (raw.length === 64) {
			return await crypto.subtle.importKey(
				"raw",
				Uint8Array.fromHex(raw),
				{
					name: "AES-GCM",
					length: 256,
				},
				true,
				["encrypt", "decrypt"],
			)
		} else {
			return await crypto.subtle.importKey(
				"raw",
				Uint8Array.fromHex(hash(raw)),
				{
					name: "AES-GCM",
					length: 256,
				},
				true,
				["encrypt", "decrypt"],
			)
		}
	} else {
		return await crypto.subtle.generateKey(
			{
				name: "AES-GCM",
				length: 256,
			},
			true,
			["encrypt", "decrypt"],
		)
	}
}
export async function exportKey(key: CryptoKey, format: "raw" | "pkcs8" | "spki") {
	const buffer = await crypto.subtle.exportKey(format, key)
	return new Uint8Array(buffer).toBase64()
}

export async function generateECDSAKeyPair(): Promise<CryptoKeyPair> {
	return await crypto.subtle.generateKey(
		{
			name: "ECDSA",
			namedCurve: "P-256", // SECG curve
		},
		true,
		["sign", "verify"],
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
			hash: { name: "SHA-256" },
		},
		key,
		data,
	)

	return new Uint8Array(signature)
}
export async function verifySign(message: string, signature: Uint8Array<ArrayBuffer>, key: CryptoKey): Promise<boolean> {
	const data = new TextEncoder().encode(message)

	return await crypto.subtle.verify(
		{
			name: "ECDSA",
			hash: { name: "SHA-256" },
		},
		key,
		signature,
		data,
	)
}

export async function cipher(text: string, key: CryptoKey | string): Promise<CipherText> {
	const encoder = new TextEncoder()

	const data = encoder.encode(text)
	const iv = crypto.getRandomValues(new Uint8Array(12))
	const buffer = await crypto.subtle.encrypt({ name: "AES-GCM", iv: iv }, await cryptoKey(key), data)

	return {
		text: new Uint8Array(buffer).toHex(),
		iv: iv,
		buffer: buffer,
	}
}
export async function decipher(cipher: CipherText, key: CryptoKey | string) {
	const decoder = new TextDecoder()

	const buffer = await crypto.subtle.decrypt({ name: "AES-GCM", iv: cipher.iv }, await cryptoKey(key), Uint8Array.fromHex(cipher.text))

	const data = decoder.decode(buffer)

	return data
}

export async function keypair(): Promise<CryptoKeyPair> {
	return await crypto.subtle.generateKey(
		{
			name: "RSA-OAEP",
			modulusLength: 2048,
			publicExponent: new Uint8Array([0x01, 0x00, 0x01]), // 65537
			hash: { name: "SHA-256" },
		},
		true,
		["encrypt", "decrypt"],
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
