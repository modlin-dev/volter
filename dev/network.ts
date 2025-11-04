import os from "node:os"

interface Adapter {
	adapter: string
	networks: Bun.SocketAddress[]
}

export function listAdapters(): Adapter[] {
	const interfaces = os.networkInterfaces()
	const results: Adapter[] = []

	for (const [name, infos] of Object.entries(interfaces)) {
		if (!infos) continue

		const networks: Bun.SocketAddress[] = []

		for (const info of infos) {
			if (!info.address) continue

			networks.push({
				address: info.address,
				family: info.family,
				port: 0,
			})
		}

		results.push({
			adapter: name,
			networks,
		})
	}

	return results
}
