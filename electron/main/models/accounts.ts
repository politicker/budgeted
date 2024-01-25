import { prisma } from '../prisma'

export async function fetchAccounts() {
	return await prisma.account.findMany()
}

export async function updateAccount(
	data: Parameters<typeof prisma.account.create>[0]['data'],
) {
	return await prisma.account.upsert({
		where: { plaidId: data.plaidId },
		update: data,
		create: data,
	})
}

export async function setPlaidAccessToken(
	plaidId: string,
	accessToken: string,
) {
	await prisma.account.update({
		where: {
			plaidId,
		},
		data: {
			plaidAccessToken: accessToken,
		},
	})
}
