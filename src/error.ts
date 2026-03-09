export enum ErrorCodes {
	// Server
	INTERNAL_SERVER_ERROR,
	SERVICE_UNAVAILABLE,

	// Client
	VALIDATION_FAILED,
	TOO_MANY_REQUESTS,

	// Resource
	ALREADY_EXISTS,
	RESOURCE_NOT_FOUND,

	// A&A
	AUTHORIZATION_REQUIRED,
	AUTHENTICATION_FAILED,
	INVALID_CREDENTIALS,
	INVALID_TOKEN,
	EXPIRED_TOKEN,
}

export interface ServerErrorOptions {
	cause?: unknown
	path?: string[]
	code?: ErrorCodes
}
export class ServerError extends Error {
	constructor(message: string, options?: ServerErrorOptions) {
		super(message, {
			cause: options?.cause,
		})
		this.message = message
		this.cause = options?.cause
		this.path = options?.path
		this.code = options?.code ?? ErrorCodes.INTERNAL_SERVER_ERROR
		this.occurred = new Date()
	}
    name = "ServerError"
	message: string
    cause?: unknown
	path?: string[]
	code: ErrorCodes
	occurred: Date
}

export class UniqueError extends ServerError {
    name = "UniqueError"
	code: ErrorCodes = ErrorCodes.ALREADY_EXISTS
}

export { ZodError as ValidationError } from "zod"
