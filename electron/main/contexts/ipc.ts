import { contextBridge, ipcRenderer } from 'electron'
import Logger from 'electron-log/renderer'

export function ipc() {
	const obj = {
		...ipcRenderer,
		// TODO: https://stackoverflow.com/a/71397089/1397097
		on: ipcRenderer.on,
		send(channel: string, ...args: any[]) {
			return ipcRenderer.send(channel, ...args)
		},
		removeAllListeners: ipcRenderer.removeAllListeners,
		// wut() {
		// 	console.log('wut')
		// 	Logger.info('ipc.ts: Checking for updates')
		// 	ipcRenderer.send('mt::CHECK_FOR_UPDATES')
		// },
	}

	contextBridge.exposeInMainWorld('ipc', obj)

	return obj
}

export type IPC = ReturnType<typeof ipc>
