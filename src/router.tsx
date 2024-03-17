import {
	Route,
	createMemoryRouter,
	createRoutesFromElements,
	redirect,
	useNavigate,
} from 'react-router-dom'
import { Root } from './components/Root'
import { TablePage } from './components/pages/TablePage'
import { ChartPage } from './components/pages/ChartPage'
import { Page } from './lib/types'
import { AccountsPage } from './components/pages/AccountsPage'
import { SettingsPage } from './components/pages/SettingsPage'
import { NetWorthPage } from './components/pages/NetWorthPage'
import { trpc } from './lib/trpc'

const LastRouteKey = 'lastRoute' as const
const lastRoute = localStorage.getItem(LastRouteKey)

function IndexRedirect() {
	const { data: isReady } = trpc.isReady.useQuery()
	const navigate = useNavigate()

	if (!isReady) return null

	if (isReady.needsConfig) {
		navigate(Page.SETTINGS)
		return null
	}

	if (isReady.needsInstitution) {
		navigate(Page.ACCOUNTS)
		return null
	}

	if (isReady.ready) {
		navigate(Page.TABLE)
		return null
	}

	return null
}

export const router = createMemoryRouter(
	createRoutesFromElements(
		<Route path="/" element={<Root />}>
			<Route index element={<IndexRedirect />} />
			<Route path={Page.TABLE} element={<TablePage />} />
			<Route path={Page.CHART} element={<ChartPage />} />
			<Route path={Page.NET_WORTH} element={<NetWorthPage />} />
			<Route path={Page.ACCOUNTS} element={<AccountsPage />} />
			<Route path={Page.SETTINGS} element={<SettingsPage />} />
		</Route>,
	),
	{
		initialEntries: lastRoute ? [lastRoute] : undefined,
	},
)

router.subscribe((route) => {
	localStorage.setItem(LastRouteKey, route.location.pathname)
})
