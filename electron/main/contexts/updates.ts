import { BrowserWindow, dialog } from 'electron'
import { createContextBridge } from '../../context'

export const updates = createContextBridge('updates', async () => {
	const { autoUpdater } = await import('electron-updater')

	let runningUpdate = false
	let win = null
	const isOsx = process.platform === 'darwin'

	autoUpdater.autoDownload = false

	autoUpdater.on('error', (error) => {
		dialog.showErrorBox(
			'Error: ',
			error === null ? 'Error: unknown' : (error.message || error).toString(),
		)
	})

	autoUpdater.on('update-available', () => {
		win!.webContents.send('mt::UPDATE_AVAILABLE')

		runningUpdate = false
	})

	autoUpdater.on('update-not-available', () => {
		dialog.showMessageBox({
			message: 'Current version is up-to-date.',
		})

		runningUpdate = false
	})

	autoUpdater.on('update-downloaded', () => {
		dialog.showMessageBox({
			message: 'Update downloaded, application will be quit for update...',
		})

		setImmediate(() => autoUpdater.quitAndInstall())
	})

	return {
		needUpdate: async ({ doUpdate }: { doUpdate: boolean }) => {
			if (doUpdate) {
				autoUpdater.downloadUpdate()
			} else {
				runningUpdate = false
			}
		},
		checkForUpdates: async () => {
			win = BrowserWindow.getFocusedWindow()

			if (!runningUpdate) {
				runningUpdate = true
				autoUpdater.checkForUpdates()
			}
		},
	}
})
