import { PathLike, promises } from 'node:original-fs'
import * as path from 'path'

async function* walk(dir: string): AsyncGenerator<string> {
	for await (const d of await promises.opendir(dir as PathLike)) {
		const entry = path.join(dir, d.name)
		if (d.isDirectory()) yield* walk(entry)
		else if (d.isFile()) yield entry
	}
}

export async function loadCSV() {
	for await (const p of walk(`${process.env.HOME}/.config/budgeted/csv`)) {
		console.log(p)
	}
}
