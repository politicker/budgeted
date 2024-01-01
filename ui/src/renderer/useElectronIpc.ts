import { useEffect, useState } from 'react'
import { windowAPI } from './windowAPI'

export function useElectronIPC<T>(channel: string): T | undefined {
	const [data, setData] = useState<T>()

	useEffect(() => {
		const listener = (_: Electron.IpcRendererEvent, arg: T) => {
			setData(arg)
		}
		windowAPI.on(channel, listener)

		return () => {
			windowAPI.removeListener(channel, listener)
		}
	}, [channel])

	return data
}

export default useElectronIPC
