import { PrismaClient } from '@prisma/client'

export const prisma = new PrismaClient({
	datasourceUrl: `file://${process.env.HOME}/.config/budgeted/db.sqlite`,
})
