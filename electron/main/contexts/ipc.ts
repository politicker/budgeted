import { contextBridge, ipcRenderer } from 'electron'

export function ipc() {
	const obj = {
		...ipcRenderer,
		// TODO: https://stackoverflow.com/a/71397089/1397097
		on: ipcRenderer.on.bind(ipcRenderer),
		send(channel: string, ...args: unknown[]) {
			return ipcRenderer.send(channel, ...args)
		},
		removeAllListeners: ipcRenderer.removeAllListeners.bind(ipcRenderer),
	}

	contextBridge.exposeInMainWorld('ipc', obj)

	return obj
}

export type IPC = ReturnType<typeof ipc>
