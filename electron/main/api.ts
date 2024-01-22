import z from 'zod'
import { initTRPC } from '@trpc/server'
import { loadAccountsFromCSV, loadTransactionsFromCSV } from './loadCSV'
import { fetchTransactions, hideTransaction } from './models/transactions'
import { fetchAccounts, updateAccount } from './models/accounts'
import {
	PLAID_COUNTRY_CODES,
	PLAID_PRODUCTS,
	createPlaidClient,
} from '../lib/plaid/client'
import { TableStateInput } from '../../src/lib/useDataTable'
import { readConfig, updateConfig } from '../lib/config'

const t = initTRPC.create({ isServer: true })
const procedure = t.procedure
const loggedProcedure = procedure.use(async ({ next, path, type }) => {
	console.log('[trpc] request -', `type=${type}`, `path=/${path}`)
	return next()
})

export const router = t.router({
	transactions: loggedProcedure
		.input(TableStateInput)
		.query(async ({ input }) => {
			return await fetchTransactions(input)
		}),

	rebuildTransactions: loggedProcedure.mutation(async () => {
		try {
			await loadAccountsFromCSV()
		} catch (e) {
			console.error('@trpc: error loading accounts', e)
		}

		try {
			await loadTransactionsFromCSV()
		} catch (e) {
			console.error('@trpc: error loading transactions', e)
		}

		return { success: true }
	}),

	hideTransaction: loggedProcedure
		.input(z.object({ plaidId: z.string() }))
		.mutation(async ({ input }) => {
			await hideTransaction(input.plaidId)
			return { success: true }
		}),

	accounts: loggedProcedure.query(async () => {
		return await fetchAccounts()
	}),
	setAccountName: loggedProcedure
		.input(z.object({ id: z.string(), name: z.string() }))
		.mutation(async ({ input }) => {
			return await updateAccount(input.id, { name: input.name })
		}),
	plaidLinkToken: loggedProcedure.query(async () => {
		const config = readConfig()
		const plaidClient = createPlaidClient(
			config.plaid.clientId,
			config.plaid.secret,
		)

		try {
			const linkResponse = await plaidClient.linkTokenCreate({
				user: {
					client_user_id: 'user-id',
				},
				client_name: 'Plaid Quickstart',
				products: PLAID_PRODUCTS,
				country_codes: PLAID_COUNTRY_CODES,
				language: 'en',
			})

			console.log(linkResponse)
			return linkResponse.data.link_token
		} catch (e) {
			console.error(e)
		}
	}),
	setPlaidPublicToken: loggedProcedure
		.input(z.string())
		.mutation(async ({ input: publicToken }) => {
			const config = readConfig()
			const plaidClient = createPlaidClient(
				config.plaid.clientId,
				config.plaid.secret,
			)

			const tokenResponse = await plaidClient.itemPublicTokenExchange({
				public_token: publicToken,
			})

			return tokenResponse.data
		}),
	setPlaidSecret: loggedProcedure
		.input(z.string())
		.mutation(({ input: secret }) => {
			updateConfig({ plaid: { secret } })
			return { success: true }
		}),
	setPlaidClientId: loggedProcedure
		.input(z.string())
		.mutation(({ input: clientId }) => {
			updateConfig({ plaid: { clientId } })
			return { success: true }
		}),
})

export type AppRouter = typeof router
