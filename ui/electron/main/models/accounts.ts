import { prisma } from '../prisma'

export async function fetchAccounts() {
	return await prisma.account.findMany()
}
