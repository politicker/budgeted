import { PrismaClient } from '@prisma/client'

export const prisma = new PrismaClient({
	datasourceUrl: process.env.APPDATA
		? `file:${process.env.APPDATA}\\budgeted\\db.sqlite`
		: `file://${process.env.HOME}/.config/budgeted/db.sqlite`,
})
