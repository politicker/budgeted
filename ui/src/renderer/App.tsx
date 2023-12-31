import React from 'react'
import styles from './App.module.css'
import useElectronIPC from './useElectronIpc'
import { Channel } from '../types'

export default function App() {
	const transactions = useElectronIPC<Record<string, any>[]>(
		Channel.TRANSACTIONS,
	)
	console.log(transactions)

	return (
		<section className={styles.transactions}>
			{transactions ? (
				transactions.map((transaction, idx) => (
					<Transaction transaction={transaction} key={idx} />
				))
			) : (
				<p>No transactions</p>
			)}
		</section>
	)
}

interface TransactionProps {
	transaction: Record<string, any>
}

const Transaction: React.FC<TransactionProps> = ({ transaction }) => {
	console.log(transaction)
	return (
		<div className={styles.transaction}>
			<p>{transaction.name}</p>
			<p>{transaction.merchantName}</p>
			<p>{transaction.amount}</p>
		</div>
	)
}
