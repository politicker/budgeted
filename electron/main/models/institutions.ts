import { prisma } from '../prisma'

export async function createInstitution(
	data: Parameters<typeof prisma.institution.create>[0]['data'],
) {
	await prisma.institution.create({
		data,
	})
}
