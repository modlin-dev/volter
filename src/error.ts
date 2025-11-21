export enum ErrorCodes {
	INTERNAL_SERVER_ERROR,
	SERVICE_UNAVAILABLE,
	VALIDATION_FAILED,
	ALREADY_EXISTS,
	RESOURCE_NOT_FOUND,
	AUTHENTICATION_FAILED,
	INVALID_TOKEN,
	TOO_MANY_REQUESTS,
}

export interface ServerErrorOptions {
	at?: string[]
	code?: ErrorCodes
}
export class ServerError {
	constructor(message: string, options?: ServerErrorOptions) {
		this.message = message
		this.at = options?.at
		this.code = options?.code ?? ErrorCodes.INTERNAL_SERVER_ERROR
		this.occurred = new Date()
	}
	message: string
	at?: string[]
	code: ErrorCodes
	occurred: Date
}

export class UniqueError extends ServerError {
	code: ErrorCodes = ErrorCodes.ALREADY_EXISTS
}

export { ZodError as ValidationError } from "zod"
