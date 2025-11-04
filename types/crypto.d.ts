export declare interface CipherText {
	text: string
	iv: Uint8Array<ArrayBuffer>
	buffer: ArrayBuffer
}

export declare function hash(password: string, hmac?: string): string

export declare function key(raw?: CryptoKey | Uint8Array<ArrayBuffer> | string): Promise<CryptoKey>
export declare function exportKey(key: CryptoKey, format: "raw" | "spki" | "pkcs8"): Promise<string>

export declare function cipher(text: string, key: CryptoKey | string): Promise<CipherText>
export declare function decipher(cipher: CipherText, key: CryptoKey | string): Promise<string>

export declare function keypair(): Promise<CryptoKeyPair>
export declare function encrypt(text: string, key: CryptoKey): Promise<Uint8Array<ArrayBuffer>>
export declare function decrypt(text: Uint8Array<ArrayBuffer>, key: CryptoKey): Promise<string>

export declare function signature(): Promise<CryptoKeyPair>
export declare function sign(message: string, key: CryptoKey): Promise<Uint8Array<ArrayBuffer>>
export declare function verifySign(message: string, signature: Uint8Array<ArrayBuffer>, key: CryptoKey): Promise<boolean>
