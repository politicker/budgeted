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
	page: z.number(),
})

export async function fetchTransactions({
	sort,
	sortColumn,
	page,
	pageSize,
}: z.infer<typeof FetchTransactionsInput>) {
	return await prisma.transaction.findMany({
		orderBy: {
			[sortColumn]: sort,
		},
		take: pageSize,
		skip: (page - 1) * pageSize,
	})
}
