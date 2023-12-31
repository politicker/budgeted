import { contextBridge, ipcRenderer } from 'electron'

export const windowAPI = {
	send: (channel: string, data: Record<string, any>) =>
		ipcRenderer.send(channel, data),
	on: (
		channel: string,
		func: (event: Electron.IpcRendererEvent, ...args: any[]) => void,
	) => {
		ipcRenderer.on(channel, (event, ...args) => func(event, ...args))
	},
	removeListener: (
		channel: string,
		func: (event: Electron.IpcRendererEvent, ...args: any[]) => void,
	) => {
		ipcRenderer.removeListener(channel, func)
	},
}

contextBridge.exposeInMainWorld('electron', windowAPI)

// It has the same sandbox as a Chrome extension.
// window.addEventListener('DOMContentLoaded', () => {
// 	const replaceText = (selector: string, text: string) => {
// 		const element = document.getElementById(selector)
// 		if (element) {
// 			element.innerText = text
// 		}
// 	}

// 	for (const type of ['chrome', 'node', 'electron']) {
// 		replaceText(
// 			`${type}-version`,
// 			// @ts-ignore
// 			process.versions[type as keyof NodeJS.ProcessVersions],
// 		)
// 	}
// })
