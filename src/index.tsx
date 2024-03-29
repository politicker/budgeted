import { createRoot } from 'react-dom/client'
import { useState } from 'react'
import { ipcLink } from 'electron-trpc/renderer'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { trpc } from './lib/trpc'
import { router } from './router'
import { RouterProvider } from 'react-router-dom'

import '@fontsource-variable/rubik'
import '@fontsource/cutive-mono'
import './index.css'
import superjson from 'superjson'

function RenderRoot() {
	const superJsonReal = (superjson as unknown as { default: typeof superjson })
		.default

	const [queryClient] = useState(
		() =>
			new QueryClient({
				defaultOptions: {
					queries: {
						keepPreviousData: true,
						refetchOnWindowFocus: false,
						staleTime: Infinity,
					},
				},
			}),
	)
	const [trpcClient] = useState(() =>
		trpc.createClient({
			links: [ipcLink()],
			transformer: superJsonReal,
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
