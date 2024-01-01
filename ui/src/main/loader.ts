import { PathLike, promises as fs } from 'node:original-fs'
import * as path from 'path'
import Parser from '@gregoranders/csv'
import { prisma } from './prisma'
import { invariant } from '../invariant'

async function* walk(dir: string): AsyncGenerator<string> {
	for await (const d of await fs.opendir(dir as PathLike)) {
		const entry = path.join(dir, d.name)
		if (d.isDirectory()) yield* walk(entry)
		else if (d.isFile()) yield entry
	}
}

interface Transaction {
	plaidId: string
	plaidAccountId: string
	date: string
	name: string
	amount: string
	category: string
	checkNumber: string
	categoryIconUrl: string
	logoUrl: string
	paymentChannel: string
	merchantName: string
	address: string
	city: string
	state: string
	lat: string
	lon: string
	postalCode: string
}

function safeParseFloat(str: string): number | undefined {
	if (str === '') return undefined
	const num = parseFloat(str)
	return isNaN(num) ? undefined : num
}

export async function loadCSV() {
	for await (const filepath of walk(
		`${process.env.HOME}/.config/budgeted/csv`,
	)) {
		console.log(filepath)
		const data = await fs.readFile(filepath, 'utf-8')
		const parser = new Parser<Transaction>()
		parser.parse(data)

		for (const transaction of parser.json) {
			console.log(transaction)

			const {
				plaidId,
				lat: strLat,
				lon: strLon,
				amount: strAmount,
				...rest
			} = transaction

			const lat = safeParseFloat(strLat)
			const lon = safeParseFloat(strLon)
			const amount = safeParseFloat(strAmount)
			invariant(
				amount !== undefined,
				`amount is undefined. strAmount: ${strAmount}`,
			)

			await prisma.transaction.upsert({
				where: { plaidId },
				update: {
					lat,
					lon,
					amount,
					...rest,
				},
				create: {
					plaidId,
					lat,
					lon,
					amount,
					...rest,
				},
			})
		}
	}
}
