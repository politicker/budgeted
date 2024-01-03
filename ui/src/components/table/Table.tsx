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
		<table className="border border-gray-700 w-full text-left">
			<thead className="bg-emerald-500">
				<tr>
					{table.getFlatHeaders().map((header) => (
						<th key={header.id} className="capitalize px-3.5 py-2">
							{flexRender(header.column.columnDef.header, header.getContext())}
						</th>
					))}
				</tr>
			</thead>
			<tbody>
				{table.getRowModel().rows.length ? (
					table.getRowModel().rows.map((row, i) => (
						<tr
							key={row.id}
							className={`
							${i % 2 === 0 ? 'bg-gray-700' : 'bg-gray-800'}
						`}
						>
							{row.getVisibleCells().map((cell) => (
								<td key={cell.id} className="px-3.5 py-2 text-white">
									{flexRender(cell.column.columnDef.cell, cell.getContext())}
								</td>
							))}
						</tr>
					))
				) : (
					<tr className="text-center h-32">
						<td colSpan={7}>No Records Found!</td>
					</tr>
				)}
			</tbody>
		</table>
	)
}
