import { trpc } from '@/lib/trpc'
import { transactionColumns } from '../columns'
import { DataTable } from '../ui/data-table/data-table'
import { useDataTable, useDataTableInput } from '@/lib/useDataTable'
import { SelectionOverlay } from '../SelectionOverlay'
import { useEffect, useState } from 'react'
import { Transaction } from '@prisma/client'
import { formatMoney } from './ChartPage'
import { Badge } from '../ui/badge'

export function TablePage() {
	const [input, setInput] = useDataTableInput()
	const [selectedRows, setSelectedRows] = useState<Transaction[]>([])
	const { data } = trpc.transactions.useQuery(input, { keepPreviousData: true })
	const { data: accounts } = trpc.accounts.useQuery()

	const table = useDataTable({
		data: data?.results ?? [],
		columns: transactionColumns,
		pageCount: data?.pageCount ?? 0,
		setInput,
		input,
		getRowId: (transaction) => transaction.plaidId,
	})

	useEffect(() => {
		const rows: Transaction[] = []

		for (const key of Object.keys(input.rowSelection)) {
			const maybeRows = [...selectedRows, ...(data?.results ?? [])]
			const row = maybeRows.find((row) => row.plaidId === key)
			if (row) rows.push(row)
		}

		setSelectedRows(rows)
	}, [input.rowSelection])
	// const { mutate } = trpc.rebuildTransactions.useMutation({
	// 	onSuccess: () => refetch(),
	// })

	return (
		<>
			<DataTable
				table={table}
				filters={[
					{
						column: 'account',
						title: 'Account',
						options:
							accounts?.map((account) => ({
								label: account.name,
								value: account.plaidId,
							})) ?? [],
					},
				]}
				metadata={
					<>
						{Boolean(selectedRows.length) ? (
							<Badge>
								Sum:{' '}
								{formatMoney(
									selectedRows.reduce((acc, row) => {
										return acc + row.amount
									}, 0),
								)}
							</Badge>
						) : data?.totalAmount ? (
							<Badge>Sum: {formatMoney(data.totalAmount)}</Badge>
						) : (
							'N/A'
						)}
					</>
				}
			/>
		</>
	)
}
