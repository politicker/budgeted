import { TRPCError, initTRPC } from '@trpc/server'
import { CountryCode } from 'plaid'
import z from 'zod'
import { TableStateInput } from '../../src/lib/useDataTable'
import { PLAID_PRODUCTS, createPlaidClient } from '../lib/plaid/client'
import { CreateConfigInput } from './api-inputs'
import {
	createAccount,
	fetchAccounts,
	updateAccount,
	upsertAccount,
} from './models/accounts'
import { upsertConfig } from './models/config'
import { createInstitution } from './models/institutions'
import { fetchTransactions, hideTransaction } from './models/transactions'
import { prisma } from './prisma'
import { extract, load, transform } from './lib/cli'
import { TRPC_ERROR_CODE_KEY } from '@trpc/server/rpc'
import { writeCronTasks } from '~electron/lib/crontab/crontab'

const AccountInput = z.object({
	id: z.string(),
	name: z.string(),
	mask: z.string().optional(),
	type: z.string().optional(),
	subtype: z.string().optional(),
})

const t = initTRPC.context().create({ isServer: true })
const procedure = t.procedure
const loggedProcedure = procedure.use(async ({ next, path, type }) => {
	console.log('[trpc] request -', `type=${type}`, `path=/${path}`)
	return next()
})

function reportError(
	code: TRPC_ERROR_CODE_KEY,
	message: string,
	cause?: unknown,
) {
	console.log('@trpc error - ', message, cause)
	throw new TRPCError({
		message,
		code,
		cause,
	})
}

export const router = t.router({
	transactions: loggedProcedure
		.input(TableStateInput)
		.query(async ({ input }) => {
			return await fetchTransactions(input)
		}),

	rebuildTransactions: loggedProcedure.mutation(() => {
		try {
			extract()
			transform()
			load()
		} catch (err) {
			reportError('INTERNAL_SERVER_ERROR', 'Error rebuilding transactions', err)
		}

		return { success: true }
	}),
	hideTransaction: loggedProcedure
		.input(z.object({ plaidId: z.string() }))
		.mutation(async ({ input }) => {
			try {
				await hideTransaction(input.plaidId)
			} catch (err) {
				reportError('INTERNAL_SERVER_ERROR', 'Error hiding transaction', err)
			}
			return { success: true }
		}),
	institutions: loggedProcedure.query(async () => {
		return await prisma.institution.findMany({
			select: {
				name: true,
				accounts: true,
				plaidId: true,
			},
		})
	}),
	accounts: loggedProcedure.query(async () => {
		try {
			return await fetchAccounts()
		} catch (err) {
			reportError('INTERNAL_SERVER_ERROR', 'Error fetching accounts', err)
		}
	}),
	setAccountName: loggedProcedure
		.input(z.object({ id: z.string(), name: z.string() }))
		.mutation(async ({ input }) => {
			try {
				return await updateAccount(input.id, { name: input.name })
			} catch (err) {
				reportError('INTERNAL_SERVER_ERROR', 'Error setting account name', err)
			}
		}),

	/**
	 * Client hits this to initiate the Plaid link UI flow. The response from
	 * this endpoint is the link token that the client uses to initialize the
	 * Plaid link UI.
	 */
	plaidLinkToken: loggedProcedure
		.input(
			z.object({
				institutionId: z.string().optional(),
			}),
		)
		.query(async ({ input: { institutionId } }) => {
			const config = await prisma.config.findFirst()
			if (!config) throw new Error('Config not found')

			const plaidClient = createPlaidClient(
				config.plaidClientId,
				config.plaidSecret,
			)

			const institution = institutionId
				? await prisma.institution.findFirst({
						where: { plaidId: institutionId },
					})
				: undefined

			try {
				const linkResponse = await plaidClient.linkTokenCreate({
					user: {
						client_user_id: 'user-id',
					},
					client_name: 'Budgeted',
					products: PLAID_PRODUCTS,
					country_codes: [CountryCode.Us],
					language: 'en',
					access_token: institution?.plaidAccessToken,
					update: institution ? { account_selection_enabled: true } : undefined,
				})

				return { token: linkResponse.data.link_token, institutionId }
			} catch (e) {
				reportError(
					'INTERNAL_SERVER_ERROR',
					'Error creating Plaid link token',
					e,
				)
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
				accounts: z.array(AccountInput),
			}),
		)
		.mutation(async ({ input }) => {
			// TODO: Do we need to dig into accounts too?
			// I think we can push the user to the update flow
			// if they try to link an account that's already linked.
			// Maybe they'd do that if they want to add more bank accounts to an already-linked
			// institution.

			// Example: https://github.com/plaid/pattern/blob/master/server/routes/items.js#L41-L49

			/**
			 * Check if the institution is already linked.
			 */
			const instExists = await prisma.institution.count({
				where: { plaidId: input.institutionId },
			})
			if (instExists > 0) {
				return { success: false }
			}

			const config = await prisma.config.findFirstOrThrow()

			const plaidClient = createPlaidClient(
				config.plaidClientId,
				config.plaidSecret,
			)

			const tokenResponse = await plaidClient.itemPublicTokenExchange({
				public_token: input.publicToken,
			})

			try {
				await createInstitution({
					plaidId: input.institutionId,
					name: input.institutionName,
					plaidAccessToken: tokenResponse.data.access_token,
				})
			} catch (err) {
				reportError('INTERNAL_SERVER_ERROR', 'Error creating institution', err)
			}

			for (const account of input.accounts) {
				await createAccount({
					plaidId: account.id,
					name: account.name,
					mask: account.mask ?? '',
					type: account.type ?? '',
					subtype: account.subtype ?? '',
					institutionPlaidId: input.institutionId,
				})
			}

			return { success: true }
		}),

	updatePlaidInstitution: loggedProcedure
		.input(
			z.object({
				institutionId: z.string(),
				accounts: z.array(AccountInput),
			}),
		)
		.mutation(async ({ input }) => {
			for (const account of input.accounts) {
				await upsertAccount({
					plaidId: account.id,
					name: account.name,
					mask: account.mask,
					type: account.type,
					subtype: account.subtype,
					institutionPlaidId: input.institutionId,
				})
			}

			return { success: true }
		}),

	createConfig: loggedProcedure
		.input(CreateConfigInput)
		.mutation(async ({ input }) => {
			try {
				await upsertConfig(input.plaidClientId, input.plaidSecret)
				return { success: true }
			} catch (e) {
				reportError('INTERNAL_SERVER_ERROR', 'Error creating config', e)
				return { success: false }
			}
		}),
	config: loggedProcedure.query(async () => {
		try {
			return await prisma.config.findFirst()
		} catch (err) {
			reportError('INTERNAL_SERVER_ERROR', 'Error fetching config', err)
		}
	}),
	writeCronTasks: loggedProcedure.mutation(writeCronTasks),
})

export type AppRouter = typeof router
