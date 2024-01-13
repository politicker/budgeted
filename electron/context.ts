export const createContextBridge = <
	T extends Record<string, Function>,
	K extends string,
>(
	apiKey: K,
	apiFactory: () => Promise<T>,
) => ({
	async main() {
		const { ipcMain } = await import('electron')
		const api = await apiFactory()

		for (const key in api) {
			const channel = `${apiKey}.${key}`

			ipcMain.on(channel, (event, ...args) => {
				api[key]!(...args)
			})
		}
	},

	async preload() {
		const { contextBridge, ipcRenderer } = await import('electron')
		const bridge: Record<string, Function> = {}
		const api = await apiFactory()

		for (const key in api) {
			bridge[key] = (...args: any[]) => {
				const channel = `${apiKey}.${key}`
				ipcRenderer.send(channel, ...args)
			}
		}

		contextBridge.exposeInMainWorld(apiKey, bridge)
	},
	get api() {
		return (window as any)[apiKey] as T
	},
})
