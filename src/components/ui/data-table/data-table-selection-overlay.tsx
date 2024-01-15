import { Table } from '@tanstack/react-table'
import { Card, CardHeader, CardTitle } from '../card'

interface DataTableSelectionOverlayProps<TData> {
	table: Table<TData>
}

export function DataTableSelectionOverlay<TData>({
	table,
}: DataTableSelectionOverlayProps<TData>) {
	const selected = table.getSelectedRowModel().rows
	const sum = selected.reduce((acc, row) => {
		// @ts-ignore
		return acc + row.original.amount
	}, 0)

	return (
		<div className="absolute right-10 bottom-20">
			<Card>
				<CardHeader>
					<CardTitle>${sum.toFixed(2)}</CardTitle>
				</CardHeader>
			</Card>
		</div>
	)
}
