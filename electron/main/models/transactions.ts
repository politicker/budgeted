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
	sorting,
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

	const orderBy = sorting.map((s) => ({ [s.id]: s.desc ? 'desc' : 'asc' }))
	orderBy.push({ date: 'desc' })

	const pageOptions = {
		take: pageSize === Infinity ? undefined : pageSize,
		skip: pageIndex === 0 ? 0 : pageIndex * pageSize,
		orderBy,
	}

	const [
		results,
		total,
		{
			_sum: { amount: totalAmount },
		},
	] = await Promise.all([
		prisma.transaction.findMany({
			where,
			include: {
				account: true,
			},
			...pageOptions,
		}),
		prisma.transaction.count({ where }),
		prisma.transaction.aggregate({
			where,
			_sum: { amount: true },
			...pageOptions,
		}),
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
