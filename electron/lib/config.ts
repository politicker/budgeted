import { JsonMap, parse, stringify } from '@iarna/toml'
import { readFileSync, writeFileSync } from 'node:original-fs'
import * as path from 'path'

const CONFIG_PATH = path.join(__dirname, '..', 'config.toml')

export interface Config {
	plaid: {
		clientId: string
		secret: string
	}
}

function writeConfig(config: JsonMap) {
	const conf = stringify(config)
	writeFileSync(CONFIG_PATH, conf, 'utf-8')
}

export function readConfig(): Config {
	const conf = readFileSync(CONFIG_PATH, 'utf-8')
	return parse(conf) as unknown as Config
}

// TODO: I think this will overwrite entire sections of the config
export function updateConfig(updates: JsonMap) {
	const config = readConfig()
	writeConfig({ ...config, ...updates })
}
