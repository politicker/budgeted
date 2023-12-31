import React from 'react'
import styles from './App.module.css'
import useElectronIPC from './useElectronIpc'
import { Channel } from '../types'
import { windowAPI } from './windowAPI'

export default function App() {
	const transactions = useElectronIPC<Record<string, any>[]>(
		Channel.TRANSACTIONS,
	)

	return (
		<section className={styles.transactions}>
			{transactions?.length ? (
				transactions.map((transaction, idx) => (
					<Transaction transaction={transaction} key={idx} />
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
	transaction: Record<string, any>
}

function Transaction({ transaction }: TransactionProps) {
	console.log(transaction)
	return (
		<div className={styles.transaction}>
			<p>{transaction.name}</p>
			<p>{transaction.merchantName}</p>
			<p>{transaction.amount}</p>
		</div>
	)
}
