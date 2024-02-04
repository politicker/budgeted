import { exposeElectronTRPC } from 'electron-trpc/main'
import { titlebar } from '../main/contexts/titlebar'

exposeElectronTRPC()
void titlebar.preload()
