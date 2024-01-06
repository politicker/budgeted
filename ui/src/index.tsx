import { createRoot } from 'react-dom/client'
import { useState } from 'react'
import { ipcLink } from 'electron-trpc/renderer'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { trpc } from './lib/trpc'
import '@fontsource-variable/rubik'
import './index.css'
import { router } from './router'
import { RouterProvider } from 'react-router-dom'

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
				<RouterProvider router={router} />
			</QueryClientProvider>
		</trpc.Provider>
	)
}

const container = document.getElementById('root') as HTMLElement
const root = createRoot(container)
root.render(<RenderRoot />)
