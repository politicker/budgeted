import { TableStateInput } from '@/lib/useDataTable'
import { z } from 'zod'
import { prisma } from '../prisma'
import { Prisma } from '@prisma/client'

function narrowFilterType(
	filter: unknown,
): asserts filter is string | string[] {
	z.union([z.string(), z.array(z.string())]).parse(filter)
}

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
		where.OR = columnFilters.map((filter) => {
			narrowFilterType(filter.value)

			switch (filter.id) {
				case 'account':
					return {
						account: {
							plaidId: Array.isArray(filter.value)
								? { in: filter.value }
								: filter.value,
						},
					}
				default:
					return {
						[filter.id]: { contains: filter.value },
					}
			}
		})
	}

	const [
		results,
		total,
		{
			_sum: { amount: totalAmount },
		},
	] = await Promise.all([
		prisma.transaction.findMany({
			orderBy: {
				[sortColumn]: sort,
			},
			take: pageSize === Infinity ? undefined : pageSize,
			skip: pageIndex === 0 ? 0 : pageIndex * pageSize,
			where,
			select: {
				plaidId: true,
				plaidAccountId: true,
				date: true,
				name: true,
				amount: true,
				category: true,
				categoryIconUrl: true,
				logoUrl: true,
				merchantName: true,
				address: true,
				city: true,
				state: true,
				hidden: true,
				account: {
					select: {
						plaidId: true,
						name: true,
						officialName: true,
						type: true,
						subtype: true,
						mask: true,
						currentBalance: true,
						availableBalance: true,
						isoCurrencyCode: true,
						institutionPlaidId: true,
					},
				},
			},
		}),
		prisma.transaction.count({ where }),
		prisma.transaction.aggregate({ where, _sum: { amount: true } }),
	])

	const pageCount = Math.ceil(total / pageSize)
	return { results, total, pageCount, totalAmount }
}

export async function hideTransaction(plaidId: string) {
	return await prisma.transaction.update({
		where: { plaidId },
		data: { hidden: true },
	})
}
