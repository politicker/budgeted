import { prisma } from '../prisma'

export async function createConfig(clientId: string, secret: string) {
	await prisma.config.create({
		data: {
			plaidClientId: clientId,
			plaidSecret: secret,
		},
	})
}
