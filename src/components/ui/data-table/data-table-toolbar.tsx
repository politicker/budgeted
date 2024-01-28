'use client'

import { Table } from '@tanstack/react-table'

import { Input } from '@/components/ui/input'
import { DataTableViewOptions } from './data-table-view-options'
import {
	DataTableFacetedFilter,
	FacetedFilterOption,
} from './data-table-faceted-filter'
import { Button } from '../button'
import { Cross2Icon } from '@radix-ui/react-icons'

export interface DataTableFilter<TData> {
	column: keyof TData
	title: string
	options: FacetedFilterOption[]
}

interface DataTableToolbarProps<TData> {
	table: Table<TData>
	filters?: DataTableFilter<TData>[]
}

export function DataTableToolbar<TData>({
	table,
	filters,
}: DataTableToolbarProps<TData>) {
	const isFiltered = table.getState().columnFilters.length > 0

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

				{filters?.map((filter) => (
					<DataTableFacetedFilter
						key={filter.column as string}
						column={table.getColumn(filter.column as string)}
						title={filter.title}
						options={filter.options}
					/>
				))}

				{isFiltered && (
					<Button
						variant="outline"
						onClick={() => table.resetColumnFilters()}
						className="h-8 px-2 lg:px-3"
					>
						Reset
						<Cross2Icon className="ml-2 h-4 w-4" />
					</Button>
				)}
			</div>
			<DataTableViewOptions table={table} />
		</div>
	)
}
