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

const configuration = new Configuration({
	basePath: PlaidEnvironments.sandbox,
	baseOptions: {
		products: PLAID_PRODUCTS,
		headers: {
			'PLAID-CLIENT-ID': process.env.CLIENT_ID,
			'PLAID-SECRET': process.env.SECRET,
		},
	},
})

export const plaidClient = new PlaidApi(configuration)
