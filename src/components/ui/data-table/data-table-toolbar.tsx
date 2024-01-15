'use client'

import { Table } from '@tanstack/react-table'

import { Input } from '@/components/ui/input'
import { DataTableViewOptions } from './data-table-view-options'

interface DataTableToolbarProps<TData> {
	table: Table<TData>
}

export function DataTableToolbar<TData>({
	table,
}: DataTableToolbarProps<TData>) {
	// const isFiltered = table.getState().columnFilters.length > 0

	return (
		<div className="flex items-center justify-between m-3">
			<div className="flex flex-1 items-center space-x-2">
				<Input
					placeholder="Filter transactions..."
					value={(table.getColumn('name')?.getFilterValue() as string) ?? ''}
					onChange={(event) =>
						table.getColumn('name')?.setFilterValue(event.target.value)
					}
					className="h-8 w-[150px] lg:w-[250px]"
				/>
				{/* {table.getColumn('merchantName') && (
					<DataTableFacetedFilter
						column={table.getColumn('merchantName')}
						title="Merchant"
						options={statuses}
					/>
				)}
				{table.getColumn('date') && (
					<DataTableFacetedFilter
						column={table.getColumn('date')}
						title="Date"
						options={priorities}
					/>
				)}
				{isFiltered && (
					<Button
						variant="ghost"
						onClick={() => table.resetColumnFilters()}
						className="h-8 px-2 lg:px-3"
					>
						Reset
						<Cross2Icon className="ml-2 h-4 w-4" />
					</Button>
				)} */}
			</div>
			<DataTableViewOptions table={table} />
		</div>
	)
}
