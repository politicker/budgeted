import { TRPCError, initTRPC } from '@trpc/server'
import z from 'zod'
import { TableStateInput } from '../../src/lib/useDataTable'

import { CreateConfigInput } from './api-inputs'
import {
	createAccount,
	fetchAccounts,
	updateAccount,
	upsertAccount,
} from './models/accounts'
import { upsertConfig } from './models/config'
import { fetchTransactions, hideTransaction } from './models/transactions'
import { prisma } from './prisma'
import { extract, load, transform } from './lib/cli'
import { TRPC_ERROR_CODE_KEY } from '@trpc/server/rpc'
import { writeCronTasks } from '../lib/crontab/crontab'
import superjson from 'superjson'
import {
	createPlaidInstitution,
	createPlaidLinkToken,
	updatePlaidInstitution,
} from './models/plaid'

const AccountInput = z.object({
	id: z.string(),
	name: z.string(),
	mask: z.union([z.string(), z.null()]).optional(),
	type: z.union([z.string(), z.null()]).optional(),
	subtype: z.union([z.string(), z.null()]).optional(),
})

const superJsonReal = (superjson as unknown as { default: typeof superjson })
	.default

const t = initTRPC
	.context()
	.create({ isServer: true, transformer: superJsonReal })
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
				logo: true,
				color: true,
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
			const institution = institutionId
				? await prisma.institution.findFirst({
						where: { plaidId: institutionId },
					})
				: undefined

			try {
				const linkResponse = await createPlaidLinkToken(institution)

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
	createPlaidInstitution: loggedProcedure
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

			try {
				await createPlaidInstitution(input)
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
			await updatePlaidInstitution(input.institutionId)

			for (const account of input.accounts) {
				await upsertAccount({
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
	writeCronTasks: loggedProcedure.mutation(() => {
		try {
			writeCronTasks()
		} catch (err) {
			reportError('INTERNAL_SERVER_ERROR', 'Error writing cron tasks', err)
		}
		return { success: true }
	}),
	accountBalances: loggedProcedure.query(async () => {
		return await prisma.accountBalance.findMany({
			orderBy: { date: 'asc' },
			include: { account: true },
		})
	}),
})

export type AppRouter = typeof router
