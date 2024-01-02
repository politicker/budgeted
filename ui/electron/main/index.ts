import { app, BrowserWindow, ipcMain } from 'electron'
import { join } from 'node:path'
import { prisma } from './prisma'
import { createIPCHandler } from 'electron-trpc/main'
import { router } from './api'

// The built directory structure
//
// ├─┬ dist-electron
// │ ├─┬ main
// │ │ └── index.js    > Electron-Main
// │ └─┬ preload
// │   └── index.js    > Preload-Scripts
// ├─┬ dist
// │ └── index.html    > Electron-Renderer
//
process.env.DIST_ELECTRON = join(__dirname, '../')
process.env.DIST = join(process.env.DIST_ELECTRON, '../dist')
process.env.VITE_PUBLIC = process.env.VITE_DEV_SERVER_URL
	? join(process.env.DIST_ELECTRON, '../public')
	: process.env.DIST

let win: BrowserWindow | null = null
const preload = join(__dirname, '../preload/index.js')
const url = process.env.VITE_DEV_SERVER_URL
const indexHtml = join(process.env.DIST, 'index.html')

function createWindow() {
	win = new BrowserWindow({
		title: 'Budgeted',
		height: 600,
		width: 900,
		webPreferences: {
			preload,
			sandbox: false,
		},
	})

	if (url) {
		console.log('loadURL', url)
		// electron-vite-vue#298
		win.loadURL(url)
		// Open devTool if the app is not packaged
		win.webContents.openDevTools()
	} else {
		win.loadFile(indexHtml)
	}
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(async () => {
	createWindow()

	if (win) {
		createIPCHandler({ router, windows: [win] })
	}

	app.on('activate', function () {
		// On macOS, it's common to re-create a window in the app when the
		// dock icon is clicked and there are no other windows open.
		if (BrowserWindow.getAllWindows().length === 0) createWindow()
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
