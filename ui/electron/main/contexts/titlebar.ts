import { createContextBridge } from '../../context'

export const titlebar = createContextBridge('titlebar', async () => {
	const { BrowserWindow } = await import('electron')

	return {
		minimize: () => BrowserWindow.getFocusedWindow()?.minimize(),
		maximize: () => {
			const win = BrowserWindow.getFocusedWindow()

			if (win?.isMaximized()) {
				win.unmaximize()
			} else {
				win?.maximize()
			}
		},
		close: () => BrowserWindow.getFocusedWindow()?.close(),
	}
})
