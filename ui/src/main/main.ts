import { app, BrowserWindow, ipcMain } from 'electron'
import * as path from 'path'
import { PrismaClient } from '@prisma/client'
import { Channel } from '../types'
import { loadCSV } from './loader'

let mainWindow: BrowserWindow | null = null
const prisma = new PrismaClient()

function createWindow() {
	console.log('hello from createWindow')
	mainWindow = new BrowserWindow({
		height: 600,
		webPreferences: {
			preload: path.join(__dirname, '..', 'preload', 'preload.js'),
		},
		width: 1600,
	})

	mainWindow.loadFile(path.join(__dirname, '..', '..', '..', 'index.html'))
	mainWindow.webContents.openDevTools()
}

export async function fetchTransactions() {
	try {
		return await prisma.transaction.findMany()
	} catch (err) {
		throw err
	}
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(async () => {
	createWindow()

	// mainWindow?.once('ready-to-show', async () => {
	// 	mainWindow?.show()
	// 	mainWindow?.webContents.send(
	// 		Channel.TRANSACTIONS,
	// 		await fetchTransactions(),
	// 	)
	// })

	app.on('activate', function () {
		// On macOS, it's common to re-create a window in the app when the
		// dock icon is clicked and there are no other windows open.
		if (BrowserWindow.getAllWindows().length === 0) createWindow()
	})

	console.log('sending transactions to renderer')
	mainWindow?.webContents.send(Channel.TRANSACTIONS, await fetchTransactions())
	ipcMain.on(Channel.BUILD_TRANSACTIONS, async () => {
		console.log('building transactions')
		await loadCSV()
	})
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', async () => {
	if (process.platform !== 'darwin') {
		app.quit()
		await prisma.$disconnect()
	}
})
