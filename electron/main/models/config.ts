import { prisma } from '../prisma'

export async function upsertConfig(plaidClientId: string, plaidSecret: string) {
	const payload = { plaidClientId, plaidSecret }
	console.log('upsertConfig', payload)

	const existingConfig = await prisma.config.findFirst()

	existingConfig
		? await prisma.config.update({
				where: { id: existingConfig.id },
				data: payload,
			})
		: await prisma.config.create({ data: payload })
}
