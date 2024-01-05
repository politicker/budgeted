import { PagesType } from '@/components/Table'
import { prisma } from '../prisma'
import { z } from 'zod'

export const FetchTransactionsInput = z.object({
	sortColumn: z.union([
		z.literal('date'),
		z.literal('description'),
		z.literal('amount'),
		z.literal('balance'),
	]),
	sort: z.union([z.literal('asc'), z.literal('desc')]),
	pageSize: z.number(),
	pageIndex: z.number(),
})

export async function fetchTransactions({
	sort,
	sortColumn,
	pageIndex,
	pageSize,
}: z.infer<typeof FetchTransactionsInput>) {
	const [results, total] = await Promise.all([
		prisma.transaction.findMany({
			orderBy: {
				[sortColumn]: sort,
			},
			take: pageSize,
			skip: pageIndex * pageSize,
		}),
		prisma.transaction.count(),
	])

	const pageCount = Math.ceil(total / pageSize)

	const page = pageIndex + 1

	const startPage = Math.max(1, page - 3)
	const endPage = Math.min(pageCount, page + 3)

	let pages: PagesType = []

	if (startPage !== 1) {
		pages.unshift('...')
	}

	pages.push(
		...Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i),
	)

	if (endPage !== pageCount) {
		pages.push('...')
	}

	return { results, total, pageCount, pages }
}
