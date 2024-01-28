import {
	Configuration,
	PlaidApi,
	Products,
	CountryCode,
	PlaidEnvironments,
} from 'plaid'
import { prisma } from '../../main/prisma'

export const PLAID_PRODUCTS = (
	process.env.PLAID_PRODUCTS || Products.Transactions
).split(',') as Products[]

export const PLAID_COUNTRY_CODES: CountryCode[] = [CountryCode.Us]

export function createPlaidClient(clientId: string, secret: string) {
	return new PlaidApi(
		new Configuration({
			basePath: PlaidEnvironments.development,
			baseOptions: {
				headers: {
					'PLAID-CLIENT-ID': clientId,
					'PLAID-SECRET': secret,
				},
			},
		}),
	)
}

export async function createPlaidClientFromConfig() {
	const config = await prisma.config.findFirst()
	if (!config) {
		throw new Error('No config found')
	}

	return createPlaidClient(config.plaidClientId, config.plaidSecret)
}
