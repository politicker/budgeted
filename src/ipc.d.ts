export interface IPC {
	on(channel: string, listener: (event: any, ...args: any[]) => void): void
	removeAllListeners(channel: string): void
}

export interface IPCWindow {
	ipc: IPC
}
