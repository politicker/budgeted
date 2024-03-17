import { autoUpdater as electronAutoUpdater } from 'electron-updater'
import log from 'electron-log'
import { BrowserWindow, app, dialog, ipcMain } from 'electron'
import { arch } from 'os'

electronAutoUpdater.logger = log

// @ts-expect-error the types are missing in this package
// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
electronAutoUpdater.logger.transports.file.level = 'info'

let runningUpdate = false
let win: Electron.BrowserWindow | null = null
// const isOsx = process.platform === 'darwin'

export function setUpdateDownloadUrl() {
	if (arch() !== 'arm64') {
		return
	}

	electronAutoUpdater.setFeedURL(
		'https://your-update-server.com/path-to-arm64-updates/',
	)
}

export function setRunningUpdate(value: boolean) {
	runningUpdate = value
}

export function getRunningUpdate() {
	return runningUpdate
}

electronAutoUpdater.autoDownload = false

electronAutoUpdater.on('error', (error) => {
	log.info('error', error)
	dialog.showErrorBox(
		'Error: ',
		error === null ? 'Error: unknown' : (error.message || error).toString(),
	)
})

electronAutoUpdater.on('update-available', () => {
	log.info('update-available')
	win?.webContents.send('mt::UPDATE_AVAILABLE')

	runningUpdate = false
})

electronAutoUpdater.on('update-not-available', () => {
	log.info(
		' ********************************************************************************************************************************************************* autoUpdater',
		'update-not-available',
	)
	void dialog.showMessageBox({
		message: 'Current version is up-to-date.',
	})

	runningUpdate = false
})

electronAutoUpdater.on('update-downloaded', () => {
	log.info('update-downloaded')
	void dialog.showMessageBox({
		message: 'Update downloaded, application will be quit for update...',
	})

	setImmediate(() => electronAutoUpdater.quitAndInstall())
})

app
	.whenReady()
	.then(() => {
		log.info('app.whenReady')
		ipcMain.on('mt::CHECK_FOR_UPDATES', () => {
			log.info('check for updates', getRunningUpdate())
			// dialog.showMessageBox({
			// 	message: 'Vher',
			// })
			win = BrowserWindow.getFocusedWindow()

			if (!getRunningUpdate()) {
				setRunningUpdate(true)
				void electronAutoUpdater.checkForUpdates()
			}
		})

		ipcMain.on(
			'mt::NEED_UPDATE',
			(event, { doUpdate }: { doUpdate: boolean }) => {
				if (doUpdate) {
					void electronAutoUpdater.downloadUpdate()
				} else {
					setRunningUpdate(false)
				}
			},
		)
	})
	.catch(console.error)

export const autoUpdater = {
	ok: true,
}
