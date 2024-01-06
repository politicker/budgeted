import {
	Route,
	createMemoryRouter,
	createRoutesFromElements,
	redirect,
} from 'react-router-dom'
import { Root } from './components/Root'
import { TransactionsTable } from './components/TransactionsTable'
import { TransactionsGraph } from './components/TransactionsGraph'
import { Page } from './lib/types'

export const router = createMemoryRouter(
	createRoutesFromElements(
		<Route path="/" element={<Root />}>
			<Route index loader={() => redirect(Page.TABLE)} />
			<Route path={Page.TABLE} element={<TransactionsTable />} />
			<Route path={Page.GRAPH} element={<TransactionsGraph />} />
		</Route>,
	),
)
