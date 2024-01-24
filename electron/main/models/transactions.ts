import { TableStateInput } from '@/lib/useDataTable'
import { z } from 'zod'
import { prisma } from '../prisma'
import { Prisma } from '@prisma/client'

export async function fetchTransactions({
	sort,
	sortColumn,
	pageIndex,
	pageSize,
	minDate,
	showHidden,
	columnFilters,
}: z.infer<typeof TableStateInput>) {
	const where: Prisma.TransactionWhereInput = {
		date: { gte: minDate },
		hidden: showHidden ? undefined : false,
	}

	if (columnFilters.length) {
		where.OR = columnFilters.map((filter) => ({
			[filter.id]: {
				contains: filter.value as string,
			},
		}))
	}

	const [results, total] = await Promise.all([
		prisma.transaction.findMany({
			orderBy: {
				[sortColumn]: sort,
			},
			take: pageSize === Infinity ? undefined : pageSize,
			skip: pageIndex === 0 ? 0 : pageIndex * pageSize,
			where,
		}),
		prisma.transaction.count({
			where,
		}),
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
