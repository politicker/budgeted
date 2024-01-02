import z from 'zod'
import { initTRPC } from '@trpc/server'
import { loadCSV } from './loadCSV'
import {
	FetchTransactionsInput,
	fetchTransactions,
} from './models/transactions'

const t = initTRPC.create({ isServer: true })

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
			console.log('@trpc: fetching transactions')
			return await fetchTransactions(input)
		}),
	rebuildTransactions: t.procedure.mutation(async () => {
		await loadCSV()
		return { success: true }
	}),
})

export type AppRouter = typeof router
