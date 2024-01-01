import React, { useEffect } from 'react'
import styles from './App.module.css'
import useElectronIPC from './useElectronIpc'
import { Channel } from '../types'
import { windowAPI } from './windowAPI'
import type { Transaction } from '@prisma/client'
import { sortBy } from 'remeda'

export default function App() {
	const ttransactions = useElectronIPC<Transaction[]>(Channel.TRANSACTIONS)
	const transactions =
		ttransactions && sortBy(ttransactions, (t) => t.date).reverse()

	useEffect(() => {
		console.log('sending ready')
		windowAPI.send(Channel.READY, {})
	}, [])

	return (
		<section className={styles.transactions}>
			{transactions?.length ? (
				transactions.map((transaction, idx) => (
					<TransactionRow transaction={transaction} key={idx} />
				))
			) : (
				<p>No transactions</p>
			)}

			<button
				onClick={() => {
					windowAPI.send(Channel.BUILD_TRANSACTIONS, {})
				}}
			>
				Rebuild Transactions
			</button>
		</section>
	)
}

interface TransactionProps {
	transaction: Transaction
}

function TransactionRow({ transaction }: TransactionProps) {
	return (
		<div className={styles.transaction}>
			<img
				src={transaction.logoUrl || transaction.categoryIconUrl}
				alt={transaction.name}
			/>
			<p>{transaction.name}</p>
			<p>{transaction.merchantName}</p>
			<p>{transaction.amount}</p>
		</div>
	)
}
