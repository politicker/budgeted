import z from 'zod'
import { initTRPC } from '@trpc/server'
import { fetchTransactions } from './main'

const t = initTRPC.create({ isServer: true })

export const router = t.router({
	greeting: t.procedure.input(z.object({ name: z.string() })).query((req) => {
		const { input } = req

		return {
			text: `Hello ${input.name}` as const,
		}
	}),
	transactions: t.procedure.query(async () => {
		console.log('@trpc: fetching transactions')
		return await fetchTransactions()
	}),
})

export type AppRouter = typeof router
