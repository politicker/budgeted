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
			<section className={cn(styles.root, 'bg-muted')}>
				<WindowControls />

				<div className="bg-background row-span-3 p-3 border-r text-center">
					<div className="flex flex-col justify-between h-full">
						<div>
							<Button variant="ghost" size="icon" asChild>
								<Link to={Page.TABLE}>
									<TableIcon />
								</Link>
							</Button>

							<Button variant="ghost" size="icon" asChild>
								<Link to={Page.CHART}>
									<BarChartIcon />
								</Link>
							</Button>

							<Button variant="ghost" size="icon" asChild>
								<Link to={Page.NET_WORTH}>
									<ValueIcon />
								</Link>
							</Button>

							<Button variant="ghost" size="icon" asChild>
								<Link to={Page.ACCOUNTS}>
									<IdCardIcon />
								</Link>
							</Button>
						</div>

						<div>
							<Button variant="ghost" size="icon" asChild>
								<Link to={Page.SETTINGS}>
									<GearIcon />
								</Link>
							</Button>
						</div>
					</div>
				</div>

				<Outlet />
				<Toaster />
			</section>
		</>
	)
}
