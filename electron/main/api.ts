import z from 'zod'
import { initTRPC } from '@trpc/server'
import { loadAccountsFromCSV, loadTransactionsFromCSV } from './loadCSV'
import {
	FetchTransactionsInput,
	fetchTransactions,
	hideTransaction,
} from './models/transactions'
import { fetchAccounts, updateAccount } from './models/accounts'

const t = initTRPC.create({ isServer: true })
const procedure = t.procedure
const loggedProcedure = procedure.use(async ({ ctx, next, path, type }) => {
	console.log('[trpc] request -', `type=${type}`, `path=/${path}`)
	return next()
})

export const router = t.router({
	transactions: loggedProcedure
		.input(FetchTransactionsInput)
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
})

export type AppRouter = typeof router
