import { prisma } from '../prisma'

export async function fetchTransactions() {
	try {
		return await prisma.transaction.findMany()
	} catch (err) {
		throw err
	}
}
