import {
	Configuration,
	PlaidApi,
	Products,
	CountryCode,
	PlaidEnvironments,
} from 'plaid'

export const PLAID_PRODUCTS = (
	process.env.PLAID_PRODUCTS || Products.Transactions
).split(',') as Products[]

export const PLAID_COUNTRY_CODES: CountryCode[] = []

export function createPlaidClient(clientId: string, secret: string) {
	return new PlaidApi(
		new Configuration({
			basePath: PlaidEnvironments.sandbox,
			baseOptions: {
				products: PLAID_PRODUCTS,
				headers: {
					'PLAID-CLIENT-ID': clientId,
					'PLAID-SECRET': secret,
				},
			},
		}),
	)
}
