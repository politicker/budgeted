import { PathLike, promises as fs } from 'node:fs'
import * as path from 'path'
import Parser from '@gregoranders/csv'
import { prisma } from './prisma'
import { invariant } from '../../src/invariant'
import { Readable } from 'node:stream'

async function* walk(dir: string): AsyncGenerator<string> {
	for await (const d of await fs.opendir(dir as PathLike)) {
		const entry = path.join(dir, d.name)
		if (d.isDirectory()) yield* walk(entry)
		else if (d.isFile()) yield entry
	}
}

interface CSVTransaction {
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

async function cacheFile(cache: Record<string, string>, url: string) {
	const name = path.basename(url)

	if (!cache[name]) {
		const data = await fetch(url)
		invariant(data.body, `fetch failed for ${url}`)

		// Readable.fromWeb(data.body)
		await fs.writeFile(
			path.join(__dirname, '..', '..', '..', 'public', 'cache', name),
			// @ts-ignore https://stackoverflow.com/questions/63630114/argument-of-type-readablestreamany-is-not-assignable-to-parameter-of-type-r
			Readable.fromWeb(data.body),
		)

		cache[name] = 'cached'
	}

	return `./cache/${name}`
}

export async function loadCSV() {
	const cache: Record<string, string> = {}

	for await (const cachepath of walk(
		path.join(__dirname, '..', '..', '..', 'public', 'cache'),
	)) {
		const name = path.basename(cachepath)
		cache[name] = 'cached'
	}

	for await (const filepath of walk(
		`${process.env.HOME}/.config/budgeted/csv`,
	)) {
		const data = await fs.readFile(filepath, 'utf-8')
		const parser = new Parser<CSVTransaction>()
		parser.parse(data)

		for (const transaction of parser.json) {
			let {
				plaidId,
				lat: strLat,
				lon: strLon,
				amount: strAmount,
				categoryIconUrl,
				logoUrl,
				...rest
			} = transaction

			const lat = safeParseFloat(strLat)
			const lon = safeParseFloat(strLon)
			const amount = safeParseFloat(strAmount)
			invariant(
				amount !== undefined,
				`amount is undefined. strAmount: ${strAmount}`,
			)

			if (categoryIconUrl) {
				categoryIconUrl = await cacheFile(cache, categoryIconUrl)
			}

			if (logoUrl) {
				logoUrl = await cacheFile(cache, logoUrl)
			}

			await prisma.transaction.upsert({
				where: { plaidId },
				update: {
					lat,
					lon,
					amount,
					categoryIconUrl,
					logoUrl,
					...rest,
				},
				create: {
					plaidId,
					lat,
					lon,
					amount,
					categoryIconUrl,
					logoUrl,
					...rest,
				},
			})
		}
	}
}
