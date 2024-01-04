import React, { useCallback, useEffect, useState } from 'react'
import styles from './App.module.css'
import type { Transaction } from '@prisma/client'
import { trpc } from '@/trpc'
import { Button } from '@/components/ui/button'
import {
	flexRender,
	getCoreRowModel,
	useReactTable,
} from '@tanstack/react-table'
import { transactionColumns } from './table/columns'
import TransactionsTable from './table/Table'
import { FetchTransactionsInput } from 'electron/main/models/transactions'
import { z } from 'zod'

export default function Transactions() {
	const [input, setInputSimple] = useState<
		z.infer<typeof FetchTransactionsInput>
	>({
		sort: 'desc',
		sortColumn: 'date',
		page: 1,
		pageSize: 10,
	})

	const setInput = useCallback(
		(inp: Partial<typeof input>) => {
			setInputSimple((prev) => ({ ...prev, ...inp }))
		},
		[setInputSimple],
	)

	const everything = trpc.transactions.useQuery(input)
	const { data, refetch } = everything
	const { mutate } = trpc.rebuildTransactions.useMutation({
		onSuccess: () => refetch(),
	})

	console.log(everything)

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
						setInput({ sort: input.sort === 'desc' ? 'asc' : 'desc' })
					}}
				>
					Sorting: {input.sort}
				</Button>
			</div>
			<TransactionsTable transactions={data} />
		</section>
	)
}
