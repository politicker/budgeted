import { exec, execSync } from 'node:child_process'

const morningSyncEntry = '0 0 * * * bin/budgeted-crontab.sh'
const eveningSyncEntry = '0 12 * * * bin/budgeted-crontab.sh'

/**
 * Writes the crontab entries for the morning and evening ETL jobs
 */
export function writeCronTasks() {
	// List current crontab entries
	exec('crontab -l', (error, stdout, stderr) => {
		if (error) {
			console.error(`Error listing crontab: ${error.message}`)
			return
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
