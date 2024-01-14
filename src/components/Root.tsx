import { useEffect } from 'react'
import styles from './Root.module.css'
import { Button } from './ui/button'
import { BarChartIcon, TableIcon, IdCardIcon } from '@radix-ui/react-icons'
import { Link, Outlet } from 'react-router-dom'
import { Page } from '@/lib/types'
import { WindowControls } from './WindowControls'

export function Root() {
	useEffect(() => {
		const root = window.document.documentElement
		root.classList.remove('light', 'dark')

		const systemTheme = window.matchMedia('(prefers-color-scheme: dark)')
			.matches
			? 'dark'
			: 'light'

		root.classList.add(systemTheme)
	}, [])

	return (
		<>
			<section className={styles.root}>
				<WindowControls />

				<div className="row-span-3 p-3 border-r text-center">
					<Button variant="ghost" size="icon">
						<Link to={Page.TABLE}>
							<TableIcon />
						</Link>
					</Button>

					<Button variant="ghost" size="icon" asChild>
						<Link to={Page.GRAPH}>
							<BarChartIcon />
						</Link>
					</Button>

					<Button variant="ghost" size="icon" asChild>
						<Link to={Page.ACCOUNTS}>
							<IdCardIcon />
						</Link>
					</Button>
				</div>

				<Outlet />
			</section>
		</>
	)
}
