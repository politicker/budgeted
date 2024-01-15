import { PagesType } from '@/components/Table'
import { SetInputType, SetPaginationType } from '@/components/TablePage'
import {
	ColumnDef,
	ColumnFilter,
	ColumnSort,
	OnChangeFn,
	PaginationState,
	RowSelectionState,
	VisibilityState,
	getCoreRowModel,
	getFacetedRowModel,
	getFacetedUniqueValues,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	useReactTable,
} from '@tanstack/react-table'

interface DataTableProps<TData, TValue> {
	columns: ColumnDef<TData, TValue>[]
	pageCount: number
	pagination: PaginationState
	pages: PagesType
	data: TData[]
	sorting: ColumnSort[]
	columnVisibility: Record<string, boolean>
	rowSelection: RowSelectionState
	columnFilters: ColumnFilter[]
	setInput: SetInputType
}

export function useDataTable<TData, TValue>({
	data,
	columns,
	pageCount,
	pagination,
	sorting,
	columnVisibility,
	rowSelection,
	columnFilters,
	setInput,
}: DataTableProps<TData, TValue>) {
	return useReactTable({
		data,
		columns,
		manualPagination: true,
		pageCount,
		state: {
			pagination,
			sorting,
			columnVisibility,
			rowSelection,
			columnFilters,
		},
		enableRowSelection: true,
		// @ts-ignore
		getRowId: (data) => data.plaidId,
		onPaginationChange: setInput as OnChangeFn<PaginationState>,
		onRowSelectionChange: setInput as OnChangeFn<RowSelectionState>,
		onSortingChange: setInput as OnChangeFn<ColumnSort[]>,
		onColumnFiltersChange: setInput as OnChangeFn<ColumnFilter[]>,
		onColumnVisibilityChange: setInput as OnChangeFn<VisibilityState>,
		getCoreRowModel: getCoreRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFacetedRowModel: getFacetedRowModel(),
		getFacetedUniqueValues: getFacetedUniqueValues(),
	})
}
