import {
	ColumnDef,
	ColumnFilter,
	TableOptions,
	Updater,
	getCoreRowModel,
	getFacetedRowModel,
	getFacetedUniqueValues,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	useReactTable,
} from '@tanstack/react-table'
import { useCallback, useState } from 'react'
import { z } from 'zod'

export const TableStateInput = z.object({
	sortColumn: z.union([
		z.literal('date'),
		z.literal('description'),
		z.literal('amount'),
		z.literal('balance'),
	]),
	sort: z.union([z.literal('asc'), z.literal('desc')]),
	pageSize: z.number(),
	pageIndex: z.number(),
	rowSelection: z.record(z.string(), z.boolean()),
	sorting: z.array(
		z.object({
			id: z.string(),
			desc: z.boolean(),
		}),
	),
	selection: z.array(z.string()),
	columnFilters: z.array(
		z.object({
			id: z.string(),
			value: z.any(),
		}),
	),
	columnVisibility: z.record(z.string(), z.boolean()),
	minDate: z.string(),
	showHidden: z.boolean().default(true),
})

export type TableStateType = z.infer<typeof TableStateInput>

type SetInputType = (inp: Updater<Partial<TableStateType>>) => void

export const DefaultState = {
	sort: 'desc' as const,
	sortColumn: 'date' as const,
	pageIndex: 0,
	pageSize: 10,
	showHidden: true,
	rowSelection: {},
	sorting: [],
	selection: [],
	columnFilters: [],
	columnVisibility: {},
	minDate: '',
}

type SetPaginationType = (
	inp: Updater<Pick<TableStateType, 'pageIndex' | 'pageSize'>>,
) => void

export function useDataTableInput() {
	const [input, setInputSimple] = useState<TableStateType>(DefaultState)

	const setInput: SetInputType = useCallback(
		(inp) => {
			// compatible with Updater
			if (typeof inp === 'function') {
				setInputSimple((prev) => ({ ...prev, ...inp(prev) }))
				return
			}

			setInputSimple((prev) => ({ ...prev, ...inp }))
		},
		[setInputSimple],
	)
	return [input, setInput] as const
}

interface DataTableProps<TData> extends Partial<TableOptions<TData>> {
	columns: ColumnDef<TData>[]
	data: TData[]
	input: Partial<TableStateType>
	pageCount: number
	setInput: SetInputType
}

export function useDataTable<TData>({
	columns,
	data,
	input,
	pageCount,
	setInput,
	...rest
}: DataTableProps<TData>) {
	return useReactTable({
		data,
		columns,
		manualPagination: true,
		manualFiltering: true,
		pageCount,
		state: {
			pagination: {
				pageIndex: input.pageIndex ?? 0,
				pageSize: input.pageSize ?? 10,
			},
			sorting: input.sorting,
			columnVisibility: input.columnVisibility,
			rowSelection: input.rowSelection,
			columnFilters: input.columnFilters as ColumnFilter[],
		},
		enableRowSelection: true,
		onPaginationChange: setInput as SetPaginationType,
		onRowSelectionChange: (updaterOrProps) =>
			typeof updaterOrProps === 'function'
				? setInput({ rowSelection: updaterOrProps(input.rowSelection ?? {}) })
				: setInput({ rowSelection: updaterOrProps }),
		onSortingChange: (updaterOrProps) =>
			typeof updaterOrProps === 'function'
				? setInput({ sorting: updaterOrProps(input.sorting ?? []) })
				: setInput({ sorting: updaterOrProps }),
		onColumnFiltersChange: (updaterOrProps) =>
			typeof updaterOrProps === 'function'
				? setInput({
						columnFilters: updaterOrProps(
							input.columnFilters as ColumnFilter[],
						),
					})
				: setInput({ columnFilters: updaterOrProps }),
		onColumnVisibilityChange: (updaterOrProps) =>
			typeof updaterOrProps === 'function'
				? setInput({
						columnVisibility: updaterOrProps(input.columnVisibility ?? {}),
					})
				: setInput({ columnVisibility: updaterOrProps }),
		getCoreRowModel: getCoreRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFacetedRowModel: getFacetedRowModel(),
		getFacetedUniqueValues: getFacetedUniqueValues(),
		...rest,
	})
}
