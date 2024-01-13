import { prisma } from '../prisma'

export async function fetchAccounts() {
	return await prisma.account.findMany()
}

export async function updateAccount(id: string, data: any) {
	return await prisma.account.update({
		where: { plaidId: id },
		data,
	})
}
