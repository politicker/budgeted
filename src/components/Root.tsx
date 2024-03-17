import { useEffect } from 'react'
import styles from './Root.module.css'
import { Button } from './ui/button'
import {
	BarChartIcon,
	TableIcon,
	IdCardIcon,
	GearIcon,
	ValueIcon,
} from '@radix-ui/react-icons'
import { Link, Outlet } from 'react-router-dom'
import { Page } from '@/lib/types'
import { WindowControls } from './WindowControls'
import { Toaster } from './ui/sonner'
import { cn } from '@/lib/utils'
import { UpdateChecker } from './UpdateChecker'
import { trpc } from '@/lib/trpc'

function NavLink({
	to,
	children,
	disabled,
}: {
	to: string
	children: React.ReactNode
	disabled: boolean
}) {
	return (
		<Button variant="ghost" size="icon" asChild={!disabled} disabled={disabled}>
			<Link to={to}>{children}</Link>
		</Button>
	)
}

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

	let { data } = trpc.isReady.useQuery()

	const isReady = data ?? { needsInstitution: true, needsConfig: true }

	console.log({ isReady })

	return (
		<>
			<section className={cn(styles.root, 'bg-muted')}>
				<WindowControls />

				<div className="bg-background row-span-3 p-3 border-r text-center">
					<div className="flex flex-col justify-between h-full">
						<div>
							<NavLink to={Page.TABLE} disabled={isReady.needsInstitution}>
								<TableIcon />
							</NavLink>

							<NavLink to={Page.CHART} disabled={isReady.needsInstitution}>
								<BarChartIcon />
							</NavLink>

							<NavLink to={Page.NET_WORTH} disabled={isReady.needsInstitution}>
								<ValueIcon />
							</NavLink>

							<NavLink to={Page.ACCOUNTS} disabled={isReady.needsConfig}>
								<IdCardIcon />
							</NavLink>
						</div>

						<div>
							<NavLink to={Page.SETTINGS} disabled={false}>
								<GearIcon />
							</NavLink>
						</div>
					</div>
				</div>

				<Outlet />
				<Toaster />
				<UpdateChecker />
			</section>
		</>
	)
}
