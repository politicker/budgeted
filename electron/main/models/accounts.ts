import { prisma } from '../prisma'

export async function fetchAccounts() {
	return await prisma.account.findMany()
}

export async function updateAccount(
	id: string,
	data: Parameters<typeof prisma.account.update>[0]['data'],
) {
	return await prisma.account.update({
		where: { plaidId: id },
		data,
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
