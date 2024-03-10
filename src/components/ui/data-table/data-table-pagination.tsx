import { Table } from '@tanstack/react-table'

interface DataTablePaginationProps<TData> {
	table: Table<TData>
	metadata?: React.ReactNode
	selectedRows?: TData[]
}

export function DataTablePagination<TData>({
	metadata,
	selectedRows,
}: DataTablePaginationProps<TData>) {
	return (
		<div className="flex items-center justify-between mx-3 mb-3">
			<div className="flex gap-4 items-center">
				<div className="text-muted-foreground leading-2">
					{selectedRows?.length ?? 0} row(s) selected.
				</div>

				<div>{metadata}</div>
			</div>
		</div>
	)
}
