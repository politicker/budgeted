import { prisma } from '../prisma'
import { z } from 'zod'
import { TableStateInput } from '@/lib/useDataTable'

export async function fetchTransactions({
	sort,
	sortColumn,
	pageIndex,
	pageSize,
	minDate,
	showHidden,
}: z.infer<typeof TableStateInput>) {
	const [results, total] = await Promise.all([
		prisma.transaction.findMany({
			orderBy: {
				[sortColumn]: sort,
			},
			take: pageSize === Infinity ? undefined : pageSize,
			skip: pageIndex === 0 ? 0 : pageIndex * pageSize,
			where: {
				date: { gte: minDate },
				hidden: showHidden ? undefined : false,
			},
		}),
		prisma.transaction.count(),
	])

	const pageCount = Math.ceil(total / pageSize)

	return { results, total, pageCount }
}

export async function hideTransaction(plaidId: string) {
	return await prisma.transaction.update({
		where: { plaidId },
		data: { hidden: true },
	})
}
