import { exposeElectronTRPC } from 'electron-trpc/main'
import { titlebar } from '../main/contexts/titlebar'
import { ipc } from '../main/contexts/ipc'
import 'electron-log/renderer'

exposeElectronTRPC()
void titlebar.preload()
void ipc()
