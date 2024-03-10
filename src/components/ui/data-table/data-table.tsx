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
import { useLocalStorage } from '@/lib/useLocalStorage'
import { z } from 'zod'

export const DEFAULT_BUDGET = '$0'

interface DataTableProps<TData> {
	table: Table<TData>
	filters?: DataTableFilter[]
	metadata?: React.ReactNode
	selectedRows?: TData[]
}

export function DataTable<TData>({
	table,
	filters,
	metadata,
	selectedRows,
}: DataTableProps<TData>) {
	const [budget, setBudget] = useLocalStorage(
		z.string(),
		'budget',
		DEFAULT_BUDGET,
	)

	return (
		<>
			<DataTableToolbar
				table={table}
				filters={filters}
				budget={budget}
				setBudget={setBudget}
			/>

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
