import z from 'zod'
import { initTRPC } from '@trpc/server'
import { loadAccountsFromCSV, loadTransactionsFromCSV } from './loadCSV'
import {
	FetchTransactionsInput,
	fetchTransactions,
} from './models/transactions'

const t = initTRPC.create({ isServer: true })

const withLogging = t.middleware(async ({ ctx, next, path, type }) => {
	console.log('@trpc: request', type, path)
	return next()
})
t.procedure.use(withLogging)

export const router = t.router({
	greeting: t.procedure.input(z.object({ name: z.string() })).query((req) => {
		const { input } = req

		return {
			text: `Hello ${input.name}` as const,
		}
	}),
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
})

export type AppRouter = typeof router
