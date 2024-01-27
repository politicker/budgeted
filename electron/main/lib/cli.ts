import { execSync } from 'node:child_process'

export function extract() {
	const result = execSync('bin/budgeted-cli load plaid-data')
	console.log(result.toString())
}

export function transform() {
	const result = execSync('bin/budgeted-cli load csv')
	console.log(result.toString())
}

export function load() {
	const result = execSync('bin/budgeted-cli load sqlite')
	console.log(result.toString())
}
