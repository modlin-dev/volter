import { getRandomValues, randomBytes } from "node:crypto"

function pad(input: string) {
	const result: string[] = []
	for (let i = 0; i < input.length; i++) {
		result.push(input[i] as string)
		if ((i + 1) % 4 === 0 && i !== input.length - 1) {
			result.push("-")
		}
	}
	return result.join("")
}

export function randomID() {
	const session = randomBytes(16).toHex()

	return pad(session)
}
export function randomPN(): string {
	const MAX = 100_000_000
	const LIMIT = Math.floor(0x1_0000_0000 / MAX) * MAX
	const buf = new Uint32Array(1)

	let v: number
	while (true) {
		getRandomValues(buf)
		v = buf[0] as number
		if (v < LIMIT) break
	}

	const padded = (v % MAX).toString().padStart(8, "0")
	return `${padded.slice(0, 4)} ${padded.slice(4)}`
}

do {
	console.log(randomID())
} while (true)
