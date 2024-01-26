import { execSync } from 'node:child_process'

export function extract() {
	const result = execSync('bin/budgeted-cli load plaid-data')
	console.log(result.toString())
}
