import z from 'zod'
import { initTRPC } from '@trpc/server'
import { loadAccountsFromCSV, loadTransactionsFromCSV } from './loadCSV'
import { fetchTransactions, hideTransaction } from './models/transactions'
import {
	fetchAccounts,
	setPlaidAccessToken,
	updateAccount,
} from './models/accounts'
import { PLAID_PRODUCTS, createPlaidClient } from '../lib/plaid/client'
import { TableStateInput } from '../../src/lib/useDataTable'
import { prisma } from './prisma'
import { createConfig } from './models/config'
import { CountryCode } from 'plaid'
import { CreateConfigInput } from './api-inputs'
import { createInstitution } from './models/institutions'

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
		} catch (e) {
			console.error('@trpc: error loading accounts', e)
		}

		try {
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

	/**
	 * Client hits this to initiate the Plaid link UI flow. The response from
	 * this endpoint is the link token that the client uses to initialize the
	 * Plaid link UI.
	 */
	plaidLinkToken: loggedProcedure.query(async () => {
		const config = await prisma.config.findFirst()
		if (!config) {
			throw new Error('Config not found')
		}

		const plaidClient = createPlaidClient(
			config.plaidClientId,
			config.plaidSecret,
		)

		try {
			const linkResponse = await plaidClient.linkTokenCreate({
				user: {
					client_user_id: 'user-id',
				},
				client_name: 'Plaid Quickstart',
				products: PLAID_PRODUCTS,
				country_codes: [CountryCode.Us],
				language: 'en',
			})

			return linkResponse.data.link_token
		} catch (e) {
			console.error(e)
			return null
		}
	}),

	/**
	 * Client hits this after the Plaid link UI flow is complete. The response
	 * from this endpoint is the public token that the client uses to retrieve
	 * the access token.
	 */
	setPlaidPublicToken: loggedProcedure
		.input(
			z.object({
				publicToken: z.string(),
				institutionName: z.string(),
				institutionId: z.string(),
				accounts: z.array(
					z.object({
						id: z.string(),
						name: z.string(),
						mask: z.string(),
						type: z.string(),
						subtype: z.string(),
					}),
				),
			}),
		)
		.mutation(async ({ input }) => {
			const config = await prisma.config.findFirstOrThrow()

			const plaidClient = createPlaidClient(
				config.plaidClientId,
				config.plaidSecret,
			)

			const tokenResponse = await plaidClient.itemPublicTokenExchange({
				public_token: input.publicToken,
			})

			await createInstitution({
				plaidId: input.institutionId,
				name: input.institutionName,
				plaidAccessToken: tokenResponse.data.access_token,
			})

			for (const account of input.accounts) {
				await updateAccount({
					plaidId: account.id,
					name: account.name,
					mask: account.mask,
					type: account.type,
					subtype: account.subtype,
				})
			}

			try {
				await setPlaidAccessToken(
					config.plaidClientId,
					tokenResponse.data.access_token,
				)
			} catch (e) {
				console.error(e)
			}

			return tokenResponse.data
		}),
	createConfig: loggedProcedure
		.input(CreateConfigInput)
		.mutation(async ({ input }) => {
			try {
				await createConfig(input.plaidClientId, input.plaidSecret)
				return { success: true }
			} catch (e) {
				console.error(e)
				return { success: false }
			}
		}),
	config: loggedProcedure.query(async () => {
		return await prisma.config.findFirst()
	}),
})

export type AppRouter = typeof router
