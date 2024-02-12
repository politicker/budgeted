import { execSync } from 'node:child_process'

export function extract() {
	const result = execSync('bin/budgeted-cli extract')
	process.stdout.write(result.toString())
}

export function transform() {
	const result = execSync('bin/budgeted-cli transform')
	process.stdout.write(result.toString())
}

export function load() {
	const result = execSync('bin/budgeted-cli load')
	process.stdout.write(result.toString())
}
