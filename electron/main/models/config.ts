import { prisma } from '../prisma'

export async function upsertConfig(clientId: string, secret: string) {
	const payload = {
		plaidClientId: clientId,
		plaidSecret: secret,
	}

	await prisma.config.upsert({
		where: {
			plaidClientId: clientId,
		},
		create: payload,
		update: payload,
	})
}
