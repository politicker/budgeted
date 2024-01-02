import { prisma } from '../prisma'
import { z } from 'zod'

export const FetchTransactionsInput = z.object({
	sortColumn: z
		.union([
			z.literal('date'),
			z.literal('description'),
			z.literal('amount'),
			z.literal('balance'),
		])
		.optional(),
	sort: z.union([z.literal('asc'), z.literal('desc')]).optional(),
})

export async function fetchTransactions({
	sort,
	sortColumn,
}: z.infer<typeof FetchTransactionsInput>) {
	return await prisma.transaction.findMany({
		orderBy: {
			[sortColumn || 'date']: sort || 'desc',
		},
	})
}
