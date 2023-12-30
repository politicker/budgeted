import { createRoot } from 'react-dom/client'
import App from './App'
import React from 'react'
import type { fetchTransactions } from '../main/main'

async function test() {
	// @ts-ignore
	// const version = await window.versions.electron()
	// console.log(version)

	// @ts-ignore
	const transactions = (await window.data.fetchTransactions()) as ReturnType<
		typeof fetchTransactions
	>
	console.log(transactions)
}

test()

const container = document.getElementById('root') as HTMLElement
const root = createRoot(container)
root.render(<App />)
