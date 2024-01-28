import { prisma } from '../prisma'

export async function createInstitution(
	data: Parameters<typeof prisma.institution.create>[0]['data'],
) {
	return await prisma.institution.create({
		data,
	})
}

export async function updateInstitution(
	plaidId: string,
	data: Parameters<typeof prisma.institution.update>[0]['data'],
) {
	return await prisma.institution.update({
		where: { plaidId },
		data,
	})
}
