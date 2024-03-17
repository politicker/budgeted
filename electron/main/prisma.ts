import { PrismaClient } from '@prisma/client'
import path from 'node:path'
import fs from 'node:fs'

const configDir = process.env.CONFIG_DIR
	? process.env.CONFIG_DIR
	: process.env.APPDATA
		? path.join(process.env.APPDATA, 'budgeted')
		: path.join(process.env.HOME ?? '', '.config/budgeted')

const sqlPath = path.join(configDir, 'db.sqlite')

fs.mkdirSync(configDir, { recursive: true })

const datasourceUrl =
	process.env.DATABASE_URL && process.env.DONT_USE_DB_URL !== 'true'
		? process.env.DATABASE_URL
		: process.env.APPDATA
			? `file:${sqlPath}`
			: `file://${sqlPath}`

console.log('connecting to', datasourceUrl)

export const prisma = new PrismaClient({
	datasourceUrl,
})
