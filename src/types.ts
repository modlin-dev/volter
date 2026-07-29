import z from "zod"

// biome-ignore lint/complexity/useRegexLiterals: Complex
export const email_regex = new RegExp(
	"(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|\"(?:[\\x01-\\x08\\x0b\\x0c\\x0e-\\x1f\\x21\\x23-\\x5b\\x5d-\\x7f]|\\\\[\\x01-\\x09\\x0b\\x0c\\x0e-\\x7f])*\")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\\x01-\\x08\\x0b\\x0c\\x0e-\\x1f\\x21-\\x5a\\x53-\\x7f]|\\\\[\\x01-\\x09\\x0b\\x0c\\x0e-\\x7f])+)\\])",
	"i"
)
export function email(params?: string) {
	return z.string().regex(email_regex, params ?? "Invalid email address")
}
export function username(_params?: string) {
	return z
		.string()
		.trim()
		.toLowerCase()
		.min(3, "Usernames must be at least 3 characters")
		.max(64, "Usernames cannot be > 64 characters")
		.regex(/^[a-z0-9._]+$/, `Usernames can only contain a-z, 0-9, .'s, and _'s`)
		.refine(x => !x.startsWith("."), "Usernames cannot start with a period")
		.refine(x => !x.endsWith("."), "Usernames cannot end with a period")
		.refine(x => !x.includes(".."), "Username cannot contain consecutive periods")
}
export function displayname(params?: string) {
	return z
		.string()
		.trim()
		.refine(val => val.replace(/\s{2,}/g, " "), params)
		.min(3)
		.max(72)
}

let v = {
	email,
	username,
    displayname
}

export default v
