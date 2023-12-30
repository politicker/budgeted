import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('data', {
	test: {
		name: 'Quinn',
	},
	ping: () => ipcRenderer.invoke('ping'),
	fetchTransactions: () => ipcRenderer.invoke('fetch-transactions'),
})

// It has the same sandbox as a Chrome extension.
window.addEventListener('DOMContentLoaded', () => {
	const replaceText = (selector: string, text: string) => {
		const element = document.getElementById(selector)
		if (element) {
			element.innerText = text
		}
	}

	for (const type of ['chrome', 'node', 'electron']) {
		replaceText(
			`${type}-version`,
			// @ts-ignore
			process.versions[type as keyof NodeJS.ProcessVersions],
		)
	}
})
