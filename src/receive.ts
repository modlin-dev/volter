export interface Email {
	from: string
	to: string[]
	subject: string
	bcc?: string[]
	cc?: string[]
	scheduled_at?: Date
	reply_to?: string[]
	html?: string
	text?: string
	tags?: {
		name: string
		value: string
	}[]
	created_at: Date
}

export class Receive {
	constructor(key?: string) {
		this.key = key
	}
	key?: string
	emails(listener: (email: Email) => void) {
		const ws = new WebSocket("wss://mail.modlin.dev:84/emails", {
			headers: {
				authorization: this.key ? `Basic ${this.key}` : undefined,
			},
		})
		ws.onmessage = ev => listener(JSON.parse(ev.data))
	}
}

export default Receive
