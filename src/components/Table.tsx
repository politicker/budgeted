import type { Transaction } from '@prisma/client'
import {
	ColumnDef,
	PaginationState,
	Table as ReactTable,
	Updater,
	flexRender,
	getCoreRowModel,
	useReactTable,
} from '@tanstack/react-table'
import { transactionColumns } from './columns'
import {
	Table as UITable,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table'
import {
	Pagination,
	PaginationContent,
	PaginationEllipsis,
	PaginationFirst,
	PaginationItem,
	PaginationLast,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
} from '@/components/ui/pagination'
import { SetInputType, SetPaginationType } from './TablePage'

export type PagesType = (number | '...')[]

interface Props<T> {
	results: T[]
	setPagination: SetPaginationType
	setInput: SetInputType
	pageCount: number
	pages: PagesType
	columns: ColumnDef<T, any>[]
	pagination: PaginationState
}

export default function Table<T>({
	results,
	setPagination,
	setInput,
	pageCount,
	pages,
	columns,
	pagination,
}: Props<T>) {
	const table = useReactTable<T>({
		data: results,
		columns,
		manualPagination: true,
		getCoreRowModel: getCoreRowModel(),
		pageCount: pageCount,
		state: { pagination },
		onPaginationChange: setPagination,
	})

	const { rows } = table.getRowModel()

	return (
		<>
			<UITable>
				<TableHeader>
					<TableRow>
						{table.getFlatHeaders().map((header) => (
							<TableHead key={header.id}>
								{flexRender(
									header.column.columnDef.header,
									header.getContext(),
								)}
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
			</UITable>

			<Pagination className="p-3 border-t">
				<PaginationContent>
					{table.getCanPreviousPage() && (
						<PaginationFirst onClick={() => table.setPageIndex(0)} />
					)}

					{table.getCanPreviousPage() && (
						<PaginationPrevious onClick={() => table.previousPage()} />
					)}

					{pages.map((page) =>
						page === '...' ? (
							<PaginationItem key={Math.random()}>
								<PaginationEllipsis />
							</PaginationItem>
						) : (
							<PaginationLink
								isActive={page === table.getState().pagination.pageIndex + 1}
								onClick={() => table.setPageIndex(page - 1)}
								key={page}
							>
								{page}
							</PaginationLink>
						),
					)}

					{table.getCanNextPage() && (
						<PaginationNext onClick={() => table.nextPage()} />
					)}

					{table.getCanNextPage() && (
						<PaginationLast
							onClick={() => table.setPageIndex(table.getPageCount() - 1)}
						/>
					)}
				</PaginationContent>
			</Pagination>
		</>
	)
}
