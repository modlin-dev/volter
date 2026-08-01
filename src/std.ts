export type ID = string
export interface Connection {
    hostname: string
    port: number
    auth: {
        username: string
        password: string
    }
}

export enum Gender {
	Male,
	Female
}
export type BloodGroup = "A+" | "A-" | "B+" | "B-" | "O+" | "O-" | "AB+" | "AB-"
export interface EmailAddress {
	displayname?: string
	address: string // "email" or "address" (unsure)
}
export interface Link {
	label: string
	url: string
}
export interface Address {
	recipient: string
	street: string
	city: string
	postalcode: string
	country: string
}
export interface Contact {
	displayname: string
	firstname?: string
	lastname?: string
	jobtitle?: string
	department?: string
	company?: string
	about?: string
	links: Link[]
	phone: string[]
	email: EmailAddress[] // in proposal of "string[]" or "EmailAddress[]"
	image?: string
	birthday?: Date
	gender?: Gender
	bloodgroup?: BloodGroup // external for "Health and Safety Act."
	address: Address[]
}

export interface User {
    id: ID
    displayname?: string
    username: string
    created_at: Date
    updated_at: Date
}

export interface Email {
	id: ID
	from: string
	to: string[]
	cc: string[]
	bcc: string[]

	subject: string
	reply_to?: string[]
	headers?: Record<string, string>
	text?: string
	html?: string
	attachments: Attachment[]

	message_id: string

	created_at: string | Date
}
export interface Attachment {
	id: ID
	filename: string | null
	content_type: string
	content_disposition: string | null
	content_id: string | null
	content?: string | Buffer<ArrayBufferLike>
}

// HTTP
export type HTTPMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH" | "HEAD" | "OPTIONS"
