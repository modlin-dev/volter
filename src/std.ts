export enum Gender {
	Male,
	Female
}
export enum BloodGroup {
	"A+",
	"A-",
	"B+",
	"B-",
	"O+",
	"O-",
	"AB+",
	"AB-"
}
export interface Email {
	displayname?: string
	address: string // might be changed to "address"
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
	email: Email[] // in proposal of "string[]" or "Email[]"
	image?: string
	birthday?: Date
	gender?: Gender
	bloodgroup?: BloodGroup // external for "Health and Safety Act."
	address: Address[]
}
