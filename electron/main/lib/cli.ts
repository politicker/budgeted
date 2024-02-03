import { execSync } from 'node:child_process'

export function extract() {
	const result = execSync('bin/budgeted-cli extract')
	console.log(result.toString())
}

export function transform() {
	const result = execSync('bin/budgeted-cli transform')
	console.log(result.toString())
}

export function load() {
	const result = execSync('bin/budgeted-cli load')
	console.log(result.toString())
}
