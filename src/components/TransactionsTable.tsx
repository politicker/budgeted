import { useCallback, useState } from 'react'
import { trpc } from '@/lib/trpc'
import { Button } from '@/components/ui/button'
import Table from './Table'
import { FetchTransactionsInput } from 'electron/main/models/transactions'
import { z } from 'zod'
import { Updater } from '@tanstack/react-table'
import { transactionColumns } from './columns'
import { pick } from 'remeda'
import { DataTable } from './ui/data-table/data-table'
import tasks from './ui/data/tasks.json'
import { columns } from './ui/data-table/columns'

export type SetInputType = (
	inp: Updater<Partial<z.infer<typeof FetchTransactionsInput>>>,
) => void

export type SetPaginationType = (
	inp: Updater<
		Pick<z.infer<typeof FetchTransactionsInput>, 'pageIndex' | 'pageSize'>
	>,
) => void

export function TransactionsTable() {
	const [input, setInputSimple] = useState<
		z.infer<typeof FetchTransactionsInput>
	>({
		sort: 'desc',
		sortColumn: 'date',
		pageIndex: 0,
		pageSize: 10,
		showHidden: true,
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
	const { data, refetch, isPreviousData } = trpc.transactions.useQuery(input, {
		keepPreviousData: true,
	})

	return (
		<DataTable
			pageCount={data?.pageCount ?? 0}
			pages={data?.pages ?? []}
			data={data?.results ?? []}
			columns={transactionColumns}
			pagination={pick(input, ['pageIndex', 'pageSize'])}
			setPagination={setInput as SetPaginationType}
		/>
	)
}

// export function TransactionsTable() {
// 	const [input, setInputSimple] = useState<
// 		z.infer<typeof FetchTransactionsInput>
// 	>({
// 		sort: 'desc',
// 		sortColumn: 'date',
// 		pageIndex: 0,
// 		pageSize: 10,
// 		showHidden: true,
// 	})

// 	const setInput: SetInputType = useCallback(
// 		(inp) => {
// 			// campitible with Updater
// 			if (typeof inp === 'function') {
// 				setInputSimple((prev) => ({ ...prev, ...inp(prev) }))
// 				return
// 			}

// 			setInputSimple((prev) => ({ ...prev, ...inp }))
// 		},
// 		[setInputSimple],
// 	)

// const { data, refetch, isPreviousData } = trpc.transactions.useQuery(input, {
// 	keepPreviousData: true,
// })
// 	const { mutate } = trpc.rebuildTransactions.useMutation({
// 		onSuccess: () => refetch(),
// 	})

// 	return (
// 		<>
// 			<div className="p-3 border-b">
// 				<Button variant="outline" onClick={() => mutate()}>
// 					Rebuild Transactions
// 				</Button>
// 				&nbsp;&nbsp;
// 				<Button
// 					variant="outline"
// 					onClick={() => {
// 						setInput({ sort: input.sort === 'desc' ? 'asc' : 'desc' })
// 					}}
// 				>
// 					Sorting: {input.sort}
// 				</Button>
// 			</div>

// 			<Table
// 				results={data?.results ?? []}
// 				pageCount={data?.pageCount ?? 0}
// 				pages={data?.pages ?? []}
// 				setPagination={setInput as SetPaginationType}
// 				setInput={setInput}
// 				columns={transactionColumns}
// 				pagination={pick(input, ['pageIndex', 'pageSize'])}
// 			/>
// 		</>
// 	)
// }
