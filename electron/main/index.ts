import { app, BrowserWindow, nativeTheme } from 'electron'
import { join } from 'node:path'
import { prisma } from './prisma'
import { createIPCHandler } from 'electron-trpc/main'
import { router } from './api'
import { titlebar } from './contexts/titlebar.js'
import windowStateKeeper from 'electron-window-state'
import log from 'electron-log'
import { autoUpdater } from './autoUpdater'

log.initialize()
log.info('Electron started', autoUpdater)

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
nativeTheme.themeSource = 'dark'

async function createWindow() {
	// Load the previous state with fallback to defaults
	const mainWindowState = windowStateKeeper({
		defaultWidth: 1000,
		defaultHeight: 800,
	})

	win = new BrowserWindow({
		title: 'Budgeted',
		x: mainWindowState.x,
		y: mainWindowState.y,
		width: mainWindowState.width,
		height: mainWindowState.height,
		frame: false,
		webPreferences: {
			preload,
			sandbox: false,
		},
	})

	// Let us register listeners on the window, so we can update the state
	// automatically (the listeners will be removed when the window is closed)
	// and restore the maximized or full screen state
	mainWindowState.manage(win)

	// win.webContents.openDevTools()

	if (url) {
		console.info('loadURL', url)
		// electron-vite-vue#298
		void win.loadURL(url)
	} else {
		void win.loadFile(indexHtml)
	}
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
void app.whenReady().then(() => {
	void createWindow()

	if (win) {
		createIPCHandler({ router, windows: [win] })
	}

	app.on('activate', function () {
		// On macOS, it's common to re-create a window in the app when the
		// dock icon is clicked and there are no other windows open.
		if (BrowserWindow.getAllWindows().length === 0) void createWindow()
	})

	void titlebar.main()
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit()
		void prisma.$disconnect()
	}
})
