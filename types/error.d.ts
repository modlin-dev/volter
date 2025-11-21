export declare enum ErrorCodes {
	INTERNAL_SERVER_ERROR,
	SERVICE_UNAVAILABLE,
	VALIDATION_FAILED,
	ALREADY_EXISTS,
	RESOURCE_NOT_FOUND,
	AUTHENTICATION_FAILED,
	INVALID_TOKEN,
	TOO_MANY_REQUESTS,
}

export declare interface ServerErrorOptions {
	at?: string[]
	code?: ErrorCodes
}
export declare class ServerError {
	constructor(message: string, options?: ServerErrorOptions)
	/** Formal description of the error. */
	message: string
	/** Where the error occurred e.g. property. */
	at?: string[]
	/** Modlin standard for error codes. */
	code: ErrorCodes
	/** Date of when the error occurred. */
	occurred: Date
}

export declare class UniqueError extends ServerError {}

export { ZodError as ValidationError } from "zod"
