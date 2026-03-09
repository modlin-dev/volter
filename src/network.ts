import type { ServerError } from "./error"

export interface APIResponse {
	data?: unknown
	error?: ServerError[]
	success?: boolean
}
