import React, { useEffect } from 'react'
import styles from './App.module.css'
import type { Transaction } from '@prisma/client'
import { trpc } from '@/trpc'
import { Button } from '@/components/Button'
import {
	flexRender,
	getCoreRowModel,
	useReactTable,
} from '@tanstack/react-table'
import { transactionColumns } from './table/columns'
import TransactionsTable from './table/Table'

export default function Transactions() {
	const [sort, setSort] = React.useState<'asc' | 'desc'>('desc')
	const { data, refetch } = trpc.transactions.useQuery({ sort })
	const { mutate } = trpc.rebuildTransactions.useMutation({
		onSuccess: () => refetch(),
	})

	const table = useReactTable({
		data: data ?? [],
		columns: transactionColumns,
		getCoreRowModel: getCoreRowModel(),
	})

	return (
		<section className={styles.root}>
			<div className={styles.nav}>
				<Button
					className="font-bold"
					onClick={() => {
						mutate()
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

			<TransactionsTable transactions={data} />
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
