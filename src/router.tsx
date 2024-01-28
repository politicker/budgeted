import {
	Route,
	createMemoryRouter,
	createRoutesFromElements,
	redirect,
} from 'react-router-dom'
import { Root } from './components/Root'
import { TablePage } from './components/pages/TablePage'
import { ChartPage } from './components/pages/ChartPage'
import { Page } from './lib/types'
import { AccountsPage } from './components/pages/AccountsPage'
import { SettingsPage } from './components/pages/SettingsPage'

const LastRouteKey = 'lastRoute' as const
const lastRoute = localStorage.getItem(LastRouteKey)

export const router = createMemoryRouter(
	createRoutesFromElements(
		<Route path="/" element={<Root />}>
			<Route index loader={() => redirect(Page.TABLE)} />
			<Route path={Page.TABLE} element={<TablePage />} />
			<Route path={Page.CHART} element={<ChartPage />} />
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
