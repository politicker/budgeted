import { createRoot } from 'react-dom/client'
import React, { useState } from 'react'
import { ipcLink } from 'electron-trpc/renderer'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './components/App'
import { trpc } from './trpc'

function RenderRoot() {
	const [queryClient] = useState(() => new QueryClient())
	const [trpcClient] = useState(() =>
		trpc.createClient({
			links: [ipcLink()],
		}),
	)

	return (
		<trpc.Provider client={trpcClient} queryClient={queryClient}>
			<QueryClientProvider client={queryClient}>
				<App />
			</QueryClientProvider>
		</trpc.Provider>
	)
}

const container = document.getElementById('root') as HTMLElement
const root = createRoot(container)
root.render(<RenderRoot />)
