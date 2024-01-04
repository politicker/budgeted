import type { Transaction } from '@prisma/client'
import {
	flexRender,
	getCoreRowModel,
	useReactTable,
} from '@tanstack/react-table'
import { transactionColumns } from './columns'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table'

const emptyArray: Transaction[] = []

export default function TransactionsTable({
	transactions,
}: {
	transactions: Transaction[] | undefined
}) {
	const table = useReactTable({
		data: transactions ?? emptyArray,
		columns: transactionColumns,
		getCoreRowModel: getCoreRowModel(),
	})

	const { rows } = table.getRowModel()

	return (
		<Table>
			<TableHeader>
				<TableRow>
					{table.getFlatHeaders().map((header) => (
						<TableHead key={header.id}>
							{flexRender(header.column.columnDef.header, header.getContext())}
						</TableHead>
					))}
				</TableRow>
			</TableHeader>

			<TableBody>
				{rows.length ? (
					rows.map((row, i) => (
						<TableRow key={row.id}>
							{row.getVisibleCells().map((cell) => (
								<TableCell key={cell.id}>
									{flexRender(cell.column.columnDef.cell, cell.getContext())}
								</TableCell>
							))}
						</TableRow>
					))
				) : (
					<TableRow>
						<TableCell colSpan={7}>No Records Found!</TableCell>
					</TableRow>
				)}
			</TableBody>
		</Table>
	)
}
