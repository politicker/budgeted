import { IPCWindow } from '@/ipc'
import log from 'electron-log/renderer'
import { useEffect } from 'react'
// import { updates } from '../../electron/main/contexts/updates'

export function UpdateChecker() {
	useEffect(() => {
		const { ipc } = window as unknown as IPCWindow

		ipc.send('mt::CHECK_FOR_UPDATES')

		ipc.on('mt::UPDATE_AVAILABLE', (e, message) => {
			const doUpdate = confirm(
				'Found an update, do you want download and install now?',
			)

			ipc.send('mt::NEED_UPDATE', { doUpdate })
		})

		return () => {
			ipc.removeAllListeners('mt::UPDATE_AVAILABLE')
			ipc.removeAllListeners('mt::UPDATE_NOT_AVAILABLE')
		}
	}, [])

	return null
}
