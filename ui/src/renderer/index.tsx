import { createRoot } from 'react-dom/client'
import React, { useState } from 'react'
import { ipcLink } from 'electron-trpc/renderer'
import { createTRPCReact } from '@trpc/react-query'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { AppRouter } from '../main/api'
import Transactions from './App'

export const trpcReact = createTRPCReact<AppRouter>()

function App() {
	const [queryClient] = useState(() => new QueryClient())
	const [trpcClient] = useState(() =>
		trpcReact.createClient({
			links: [ipcLink()],
		}),
	)

	return (
		<trpcReact.Provider client={trpcClient} queryClient={queryClient}>
			<QueryClientProvider client={queryClient}>
				<Transactions />
			</QueryClientProvider>
		</trpcReact.Provider>
	)
}

const container = document.getElementById('root') as HTMLElement
const root = createRoot(container)
root.render(<App />)
