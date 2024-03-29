import { prisma } from '../prisma'

export async function fetchAccounts() {
	return await prisma.account.findMany()
}

export async function createAccount(
	data: Parameters<typeof prisma.account.create>[0]['data'],
) {
	return await prisma.account.create({ data })
}

export async function updateAccount(
	plaidId: string,
	data: Parameters<typeof prisma.account.update>[0]['data'],
) {
	return await prisma.account.update({
		where: { plaidId },
		data,
	})
}
export async function upsertAccount(
	data: Parameters<typeof prisma.account.upsert>[0]['create'],
) {
	return await prisma.account.upsert({
		where: { plaidId: data.plaidId },
		create: data,
		update: {
			mask: data.mask,
			type: data.type,
			subtype: data.subtype,
		},
	})
}
