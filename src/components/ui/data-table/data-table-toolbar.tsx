'use client'

import { Table } from '@tanstack/react-table'
import { InlineInput, Input } from '@/components/ui/input'
import { DataTableViewOptions } from './data-table-view-options'
import {
	DataTableFacetedFilter,
	FacetedFilterOption,
} from './data-table-faceted-filter'
import { Button } from '../button'
import { Cross2Icon } from '@radix-ui/react-icons'
import { formatMoney, parseMoney } from '@/lib/money'
import { DEFAULT_BUDGET } from './data-table'

export interface DataTableFilter {
	id: string
	title: string
	render?: () => React.ReactNode
	options?: FacetedFilterOption[]
}

interface DataTableToolbarProps<TData> {
	table: Table<TData>
	filters?: DataTableFilter[]
	setBudget: (budget: string) => void
	budget: string | undefined
}

export function DataTableToolbar<TData>({
	table,
	filters,
	budget,
	setBudget,
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

				{filters?.map((filter) =>
					filter.render ? (
						filter.render() // filter.render() // we dont have the valyewoirwlkejrwe
					) : (
						<DataTableFacetedFilter
							key={filter.id}
							column={table.getColumn(filter.id)}
							title={filter.title}
							options={filter.options ?? []}
						/>
					),
				)}

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

				<div data-role="controls" className="p-3">
					Budget:{' '}
					<InlineInput
						className="w-20 text-right"
						value={budget}
						onChange={(e) => {
							if (!e.target.value) {
								return setBudget(DEFAULT_BUDGET)
							}

							const value = parseMoney(e.target.value)
							if (isNaN(value)) {
								return setBudget(DEFAULT_BUDGET)
							}

							setBudget(formatMoney(value))
						}}
					/>
				</div>
			</div>
			<DataTableViewOptions table={table} />
		</div>
	)
}
