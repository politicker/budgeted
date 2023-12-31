import React from 'react'
import styles from './App.module.css'
import useElectronIPC from './useElectronIpc'

export default function App() {
	const data = useElectronIPC<string>('transactions')

	return <div>{data && <p>Received data: {data}</p>}</div>
}
