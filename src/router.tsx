import {
	Route,
	createMemoryRouter,
	createRoutesFromElements,
	redirect,
} from 'react-router-dom'
import { Root } from './components/Root'
import { TablePage } from './components/TablePage'
import { ChartPage } from './components/ChartPage'
import { Page } from './lib/types'
import { AccountsPage } from './components/AccountsPage'
import { SettingsPage } from './components/SettingsPage'

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
)
