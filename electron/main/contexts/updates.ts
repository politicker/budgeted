// import { ipcMain } from 'electron'
// import { createContextBridge } from '../../context'
// import log from 'electron-log/renderer'

// // import { getRunningUpdate } from '../autoUpdater'

// export const updates = createContextBridge(
// 	'updates',
// 	async (preload: boolean) => {
// 		if (preload) {
// 			return {
// 				needUpdate: async ({ doUpdate }: { doUpdate: boolean }) => {
// 					console.log('needUpdate', doUpdate)
// 				},
// 				checkForUpdates: async () => {
// 					console.log('**STUB** checkForUpdates')
// 				},
// 			}
// 		}

// 		return {
// 			needUpdate: async ({ doUpdate }: { doUpdate: boolean }) => {
// 				const { BrowserWindow } = await import('electron')
// 				const { autoUpdater, setRunningUpdate, setWin, getRunningUpdate } =
// 					await import('../autoUpdater')

// 				if (doUpdate) {
// 					autoUpdater.downloadUpdate()
// 				} else {
// 					setRunningUpdate(false)
// 				}
// 			},
// 			checkForUpdates: async () => {
// 				const { BrowserWindow } = await import('electron')
// 				const { autoUpdater, setRunningUpdate, setWin, getRunningUpdate } =
// 					await import('../autoUpdater')

// 				log.info('********** check for updates')
// 				setWin(BrowserWindow.getFocusedWindow())

// 				if (!getRunningUpdate()) {
// 					setRunningUpdate(true)
// 					autoUpdater.checkForUpdates()
// 				}
// 			},
// 		}
// 	},
// )
