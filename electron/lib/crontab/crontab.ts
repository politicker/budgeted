import { exec, execSync } from 'node:child_process'
import path from 'node:path'

const pwd = execSync('pwd').toString().trim()
const scriptPath = path.join(pwd, 'bin/budgeted-crontab.sh')

const morningSyncEntry = `0 0 * * * ${scriptPath}`
const eveningSyncEntry = `0 12 * * * ${scriptPath}`

/**
 * Writes the crontab entries for the morning and evening ETL jobs
 */
export function writeCronTasks() {
	// List current crontab entries
	exec('crontab -l', (error, stdout) => {
		if (error) {
			throw new Error('error listing crontab ${error.message}')
		}

		// TODO: Eventually remove old budgeted entries and re-write them
		const oldCrontab = stdout.trim()
		if (oldCrontab.includes('budgeted-crontab.sh')) {
			console.log('crontab already contains entries for budgeted')
			return
		}

		const updatedCrontab = `${oldCrontab}\n${morningSyncEntry}\n${eveningSyncEntry}`

		// Update the crontab
		execSync(`echo "${updatedCrontab}" | crontab -`)
	})
}
