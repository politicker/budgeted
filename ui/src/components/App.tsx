import { useCallback, useState } from 'react'
import styles from './App.module.css'
import { trpc } from '@/trpc'
import { Button } from '@/components/ui/button'
import Table from './Table'
import { FetchTransactionsInput } from 'electron/main/models/transactions'
import { z } from 'zod'
import { Updater } from '@tanstack/react-table'
import { transactionColumns } from './columns'
import { pick } from 'remeda'

export type SetInputType = (
	inp: Updater<Partial<z.infer<typeof FetchTransactionsInput>>>,
) => void

export type SetPaginationType = (
	inp: Updater<
		Pick<z.infer<typeof FetchTransactionsInput>, 'pageIndex' | 'pageSize'>
	>,
) => void

export default function Transactions() {
	const [input, setInputSimple] = useState<
		z.infer<typeof FetchTransactionsInput>
	>({
		sort: 'desc',
		sortColumn: 'date',
		pageIndex: 0,
		pageSize: 10,
	})

	const setInput: SetInputType = useCallback(
		(inp) => {
			// campitible with Updater
			if (typeof inp === 'function') {
				setInputSimple((prev) => ({ ...prev, ...inp(prev) }))
				return
			}

			setInputSimple((prev) => ({ ...prev, ...inp }))
		},
		[setInputSimple],
	)

	const { data, refetch } = trpc.transactions.useQuery(input)
	const { mutate } = trpc.rebuildTransactions.useMutation({
		onSuccess: () => refetch(),
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
						setInput({ sort: input.sort === 'desc' ? 'asc' : 'desc' })
					}}
				>
					Sorting: {input.sort}
				</Button>
			</div>

			<Table
				results={data?.results ?? []}
				pageCount={data?.pageCount ?? 0}
				pages={data?.pages ?? []}
				setPagination={setInput as SetPaginationType}
				setInput={setInput}
				columns={transactionColumns}
				pagination={pick(input, ['pageIndex', 'pageSize'])}
			/>
		</section>
	)
}
