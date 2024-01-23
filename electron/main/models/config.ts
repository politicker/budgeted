import { prisma } from '../prisma'

export async function createConfig(clientId: string, secret: string) {
	await prisma.config.create({
		data: {
			plaidClientId: clientId,
			plaidSecret: secret,
		},
	})
}

export async function setPlaidAccessToken(
	clientId: string,
	accessToken: string,
) {
	await prisma.config.update({
		where: {
			plaidClientId: clientId,
		},
		data: {
			plaidAccessToken: accessToken,
		},
	})
}
