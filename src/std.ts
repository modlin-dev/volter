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
    id: string
    displayname?: string
    username: string
    created_at: Date
    updated_at: Date
}
