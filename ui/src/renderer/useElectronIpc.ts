import { useEffect, useState } from 'react'

export function useElectronIPC<T>(channel: string): T | undefined {
	const [data, setData] = useState<T>()

	useEffect(() => {
		const listener = (_: Electron.IpcRendererEvent, arg: T) => setData(arg)
		//@ts-ignore
		window.electron.on(channel, listener)

		return () => {
			// @ts-ignore
			window.electron.removeListener(channel, listener)
		}
	}, [channel])

	return data
}

export default useElectronIPC
