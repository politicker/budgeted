'use client'

import { Table, flexRender } from '@tanstack/react-table'

import {
	Table as UITable,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table'

import { DataTablePagination } from './data-table-pagination'
import { DataTableFilter, DataTableToolbar } from './data-table-toolbar'

interface DataTableProps<TData> {
	table: Table<TData>
	filters?: DataTableFilter<TData>[]
	metadata?: React.ReactNode
	selectedRows?: TData[]
}

export function DataTable<TData>({
	table,
	filters,
	metadata,
	selectedRows,
}: DataTableProps<TData>) {
	return (
		<>
			<DataTableToolbar table={table} filters={filters} />

			<div className="rounded-md border overflow-auto mx-3 mb-3 bg-background">
				<UITable>
					<TableHeader>
						{table.getHeaderGroups().map((headerGroup) => (
							<TableRow key={headerGroup.id}>
								{headerGroup.headers.map((header) => {
									return (
										<TableHead key={header.id} colSpan={header.colSpan}>
											{header.isPlaceholder
												? null
												: flexRender(
														header.column.columnDef.header,
														header.getContext(),
													)}
										</TableHead>
									)
								})}
							</TableRow>
						))}
					</TableHeader>
					<TableBody>
						{table.getRowModel().rows?.length ? (
							table.getRowModel().rows.map((row) => (
								<TableRow
									key={row.id}
									data-state={row.getIsSelected() && 'selected'}
								>
									{row.getVisibleCells().map((cell) => (
										<TableCell key={cell.id}>
											{flexRender(
												cell.column.columnDef.cell,
												cell.getContext(),
											)}
										</TableCell>
									))}
								</TableRow>
							))
						) : (
							<TableRow>
								<TableCell
									colSpan={table.getAllColumns().length}
									className="h-24 text-center"
								>
									No results.
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</UITable>
			</div>

			<DataTablePagination
				table={table}
				metadata={metadata}
				selectedRows={selectedRows}
			/>
		</>
	)
}
