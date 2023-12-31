import { windowAPI as serverWindowAPI } from '../preload/preload'

const wwindow = window as unknown as {
	electron: typeof serverWindowAPI
}

export const windowAPI = wwindow.electron
