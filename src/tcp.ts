import { stdout } from "bun"

const args = Bun.argv

if (args.length === 2) {
} else {
	let hostname = "localhost"
	let port = 3000
	let data = "Hello, world!"

	for (let i = 2; i < args.length; i++) {
		const arg = args[i]
		switch (arg) {
			case "-h": {
				hostname = args[i + 1] ?? "localhost"
				i++
				break
			}
			case "-p": {
				port = +(args[i + 1] ?? "3000")
				i++
				break
			}
			default:
				data = args.slice(i).join(" ")
				break
		}
	}

	const timings = new Map()
	for (let i = 0; i < 512; i++) {
		stdout.write(`dispatch: ${i + 1}\n`)
		const start = Date.now()
		Bun.connect({
			hostname,
			port,

			socket: {
				data(socket, data) {
					const end = Date.now()
					timings.set(i, end - start)
					stdout.write(`${i + 1}: ${data.toString()}`)
				},
				open(socket) {
					socket.write(data)
				},
				close(socket, error) {},
				drain(socket) {},
				error(socket, error) {},

				// client-specific handlers
				connectError(socket, error) {}, // connection failed
				end(socket) {}, // connection closed by server
				timeout(socket) {}, // connection timed out
			},
		})
	}
	setTimeout(() => console.log(timings), 6_000)
}
