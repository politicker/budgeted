import { TableStateInput } from '@/lib/useDataTable'
import { z } from 'zod'
import { prisma } from '../prisma'
import { Prisma } from '@prisma/client'

function narrowFilterType(filter: unknown) {
	return z.union([z.string(), z.number(), z.array(z.string())]).parse(filter)
}

export async function fetchTransactions({
	sorting,
	pageIndex,
	pageSize,
	showHidden,
	columnFilters,
}: z.infer<typeof TableStateInput>) {
	const where: Prisma.TransactionWhereInput = {
		hidden: showHidden ? undefined : false,
	}

	if (columnFilters.length) {
		where.OR = columnFilters.map((filter) => {
			const filterValue = narrowFilterType(filter.value)

			switch (filter.id) {
				case 'account':
					return {
						account: {
							plaidId: Array.isArray(filterValue)
								? { in: filterValue }
								: (filterValue as string),
						},
					}
				case 'dayRange':
					return {
						date: {
							gte: new Date(
								Date.now() -
									parseInt(filterValue as string) * 24 * 60 * 60 * 1000,
							)
								.toISOString()
								.slice(0, 10),
						},
					}
				default:
					return {
						[filter.id]: { contains: filterValue },
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
