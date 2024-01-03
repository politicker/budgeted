import type { Transaction } from '@prisma/client'
import {
	flexRender,
	getCoreRowModel,
	useReactTable,
} from '@tanstack/react-table'
import { transactionColumns } from './columns'

export default function TransactionsTable({
	transactions = [],
}: {
	transactions: Transaction[] | undefined
}) {
	const table = useReactTable({
		data: transactions,
		columns: transactionColumns,
		getCoreRowModel: getCoreRowModel(),
	})

	return (
		<table>
			<thead>
				<tr>
					{table.getFlatHeaders().map((header) => (
						<th key={header.id}>
							{flexRender(header.column.columnDef.header, header.getContext())}
						</th>
					))}
				</tr>
			</thead>
			<tbody>
				{table.getRowModel().rows.map((row) => (
					<tr key={row.id}>
						{row.getVisibleCells().map((cell) => (
							<td key={cell.id}>
								{flexRender(cell.column.columnDef.cell, cell.getContext())}
							</td>
						))}
					</tr>
				))}
			</tbody>
		</table>
	)
}
