import z from 'zod'
import { initTRPC } from '@trpc/server'
import { loadAccountsFromCSV, loadTransactionsFromCSV } from './loadCSV'
import {
	FetchTransactionsInput,
	fetchTransactions,
	hideTransaction,
} from './models/transactions'
import { fetchAccounts } from './models/accounts'

const t = initTRPC.create({ isServer: true })

const withLogging = t.middleware(async ({ ctx, next, path, type }) => {
	console.log('@trpc: request', type, path)
	return next()
})
t.procedure.use(withLogging)

export const router = t.router({
	transactions: t.procedure
		.input(FetchTransactionsInput)
		.query(async ({ input }) => {
			console.log('@trpc: fetching transactions', input)
			return await fetchTransactions(input)
		}),

	rebuildTransactions: t.procedure.mutation(async () => {
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

		console.log('@trpc: loaded transactions and accounts')
		return { success: true }
	}),

	hideTransaction: t.procedure
		.input(z.object({ plaidId: z.string() }))
		.mutation(async ({ input }) => {
			await hideTransaction(input.plaidId)
			console.log('@trpc: hiding transaction', input)
			return { success: true }
		}),

	accounts: t.procedure.query(async () => {
		console.log('@trpc: fetching accounts')
		return await fetchAccounts()
	}),
})

export type AppRouter = typeof router
