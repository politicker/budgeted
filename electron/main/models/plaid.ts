import {
	PLAID_COUNTRY_CODES,
	PLAID_PRODUCTS,
	createPlaidClientFromConfig,
} from '../../lib/plaid/client'
import { createInstitution, updateInstitution } from './institutions'

export async function createPlaidLinkToken(
	institution?: {
		plaidAccessToken: string
	} | null,
) {
	const plaidClient = await createPlaidClientFromConfig()

	return await plaidClient.linkTokenCreate({
		user: {
			client_user_id: 'user-id',
		},
		client_name: 'Budgeted',
		products: PLAID_PRODUCTS,
		country_codes: PLAID_COUNTRY_CODES,
		language: 'en',
		access_token: institution?.plaidAccessToken,
		update: institution ? { account_selection_enabled: true } : undefined,
	})
}

export async function createPlaidInstitution(input: {
	publicToken: string
	institutionId: string
	institutionName: string
}) {
	const plaidClient = await createPlaidClientFromConfig()

	const tokenResponse = await plaidClient.itemPublicTokenExchange({
		public_token: input.publicToken,
	})

	const institution = await plaidClient.institutionsGetById({
		institution_id: input.institutionId,
		country_codes: PLAID_COUNTRY_CODES,
	})

	const logo = institution.data.institution.logo
	const color = institution.data.institution.primary_color

	await createInstitution({
		plaidId: input.institutionId,
		name: input.institutionName,
		plaidAccessToken: tokenResponse.data.access_token,
		logo,
		color,
	})
}

export async function updatePlaidInstitution(institutionId: string) {
	const plaidClient = await createPlaidClientFromConfig()

	const institution = await plaidClient.institutionsGetById({
		institution_id: institutionId,
		country_codes: PLAID_COUNTRY_CODES,
		options: { include_optional_metadata: true },
	})

	const logo = institution.data.institution.logo
	const color = institution.data.institution.primary_color

	console.log('updatePlaidInstitution', institutionId, logo, color, institution)
	await updateInstitution(institutionId, { logo, color })
}
