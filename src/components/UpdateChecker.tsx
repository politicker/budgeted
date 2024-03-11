import { IPCWindow } from '@/ipc'
import { useEffect } from 'react'
import { updates } from '~electron/main/contexts/updates'

export function UpdateChecker() {
	useEffect(() => {
		const { ipc } = window as unknown as IPCWindow
		updates.api.checkForUpdates()

		ipc.on('mt::UPDATE_AVAILABLE', (e, message) => {
			updates.api.needUpdate({
				doUpdate: confirm(
					'Found an update, do you want download and install now?',
				),
			})
		})

		return () => ipc.removeAllListeners('mt::UPDATE_AVAILABLE')
	}, [])

	return null
}
