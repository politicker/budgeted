import { BrowserWindow, contextBridge } from 'electron'
import { exposeElectronTRPC } from 'electron-trpc/main'
import { titlebar } from '..//main/contexts/titlebar'

exposeElectronTRPC()
titlebar.preload()
