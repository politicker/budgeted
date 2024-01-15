export function createContextBridge<
	// eslint-disable-next-line @typescript-eslint/ban-types
	T extends Record<string, Function>,
	K extends string,
>(apiKey: K, apiFactory: () => Promise<T>) {
	return {
		async main() {
			const { ipcMain } = await import('electron')
			const api = await apiFactory()

			for (const key in api) {
				const channel = `${apiKey}.${key}`

				ipcMain.on(channel, (event, ...args: unknown[]) => {
					api[key]?.(...args)
				})
			}
		},

		async preload() {
			const { contextBridge, ipcRenderer } = await import('electron')
			// eslint-disable-next-line @typescript-eslint/ban-types
			const bridge: Record<string, Function> = {}
			const api = await apiFactory()

			for (const key in api) {
				bridge[key] = (...args: unknown[]) => {
					const channel = `${apiKey}.${key}`
					ipcRenderer.send(channel, ...args)
				}
			}

			contextBridge.exposeInMainWorld(apiKey, bridge)
		},
		get api() {
			const ContextWindow = window as unknown
			if (
				typeof ContextWindow !== 'object' ||
				!ContextWindow ||
				!(apiKey in ContextWindow)
			) {
				throw new Error(
					`You must call ${apiKey}.preload() before using ${apiKey}.api`,
				)
			}

			return ContextWindow[apiKey as keyof typeof ContextWindow] as T
		},
	}
}
