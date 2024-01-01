import React, { useEffect } from 'react'
import styles from './App.module.css'
import { Channel } from '../types'
import { windowAPI } from './windowAPI'
import type { Transaction } from '@prisma/client'
import { trpcReact } from '.'

export default function Transactions() {
	const { data } = trpcReact.transactions.useQuery()

	useEffect(() => {
		windowAPI.send(Channel.READY, {})
	}, [])

	return (
		<section className={styles.root}>
			<div>
				<button
					onClick={() => {
						windowAPI.send(Channel.BUILD_TRANSACTIONS, {})
					}}
				>
					Rebuild Transactions
				</button>
			</div>

			<div className={styles.content}>
				{data?.length ? (
					data.map((transaction, idx) => (
						<TransactionRow transaction={transaction} key={idx} />
					))
				) : (
					<p>No transactions</p>
				)}
			</div>
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
