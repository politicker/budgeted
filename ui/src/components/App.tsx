import React, { useEffect } from 'react'
import styles from './App.module.css'
import type { Transaction } from '@prisma/client'
import { trpc } from '../trpc'
import { Button } from './Button'

export default function Transactions() {
	const [sort, setSort] = React.useState<'asc' | 'desc'>('desc')
	const { data, refetch } = trpc.transactions.useQuery({ sort })
	const { mutate } = trpc.rebuildTransactions.useMutation({
		onSuccess: () => refetch(),
	})

	return (
		<section className={styles.root}>
			<div className={styles.nav}>
				<Button
					onClick={() => {
						mutate()
						refetch()
					}}
				>
					Rebuild Transactions
				</Button>
				&nbsp;&nbsp;
				<Button
					onClick={() => {
						setSort((prev) => (prev === 'asc' ? 'desc' : 'asc'))
					}}
				>
					Sorting: {sort}
				</Button>
			</div>

			<div className={styles.content}>
				{data?.length ? (
					data.map((transaction) => (
						<TransactionRow
							transaction={transaction}
							key={transaction.plaidId}
						/>
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
