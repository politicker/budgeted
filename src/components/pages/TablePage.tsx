import { trpc } from '@/lib/trpc'
import { transactionColumns } from '../columns'
import { DataTable } from '../ui/data-table/data-table'
import { useDataTable, useDataTableInput } from '@/lib/useDataTable'
import { useEffect, useState } from 'react'
import { formatMoney } from '@/lib/money'
import { Badge } from '../ui/badge'
import type { fetchTransactions } from '~electron/main/models/transactions'
import { DayRangeInput } from '../DayRangeInput'

type Transaction = Awaited<ReturnType<typeof fetchTransactions>>['results'][0]

export function TablePage() {
	const [input, setInput] = useDataTableInput()
	const { data } = trpc.transactions.useQuery(input, { keepPreviousData: true })
	const [selectedRows, setSelectedRows] = useState<Transaction[]>([])
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

	return (
		<>
			<DataTable
				table={table}
				selectedRows={selectedRows}
				filters={[
					{
						id: 'account',
						title: 'Account',
						options:
							accounts?.map((account) => ({
								label: account.name,
								value: account.plaidId,
							})) ?? [],
					},
					{
						id: 'dayRange',
						title: 'Day Range',
						render: () => (
							<DayRangeInput
								dayRange={
									(input.columnFilters.find(
										(filter) => filter.id === 'dayRange',
									)?.value as number) ?? 30
								}
								setDayRange={(value) =>
									setInput({
										columnFilters: [
											{
												id: 'dayRange',
												value,
											},
										],
									})
								}
							/>
						),
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
							<Badge variant="secondary">
								Sum: {formatMoney(data.totalAmount)}
							</Badge>
						) : (
							'N/A'
						)}
					</>
				}
			/>
		</>
	)
}
