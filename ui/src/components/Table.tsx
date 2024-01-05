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
import { SetInputType, SetPaginationType } from './App'

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

			<Pagination className="p-3">
				<PaginationContent>
					{table.getCanPreviousPage() && (
						<PaginationItem>
							<PaginationFirst onClick={() => table.setPageIndex(0)} />
						</PaginationItem>
					)}

					{table.getCanPreviousPage() && (
						<PaginationItem>
							<PaginationPrevious onClick={() => table.previousPage()} />
						</PaginationItem>
					)}

					{pages.map((page) => (
						<PaginationItem key={page}>
							{page === '...' ? (
								<PaginationEllipsis key={Math.random()} />
							) : (
								<PaginationLink
									isActive={page === table.getState().pagination.pageIndex + 1}
									onClick={() => table.setPageIndex(page)}
								>
									{page}
								</PaginationLink>
							)}
						</PaginationItem>
					))}

					{table.getCanNextPage() && (
						<PaginationItem>
							<PaginationNext onClick={() => table.nextPage()} />
						</PaginationItem>
					)}

					{table.getCanNextPage() && (
						<PaginationItem>
							<PaginationLast
								onClick={() => table.setPageIndex(table.getPageCount() - 1)}
							/>
						</PaginationItem>
					)}
				</PaginationContent>
			</Pagination>
		</>
	)
}
