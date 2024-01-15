import { cn } from '@/lib/utils'
import { titlebar } from '~electron/main/contexts/titlebar'
import { HTMLAttributes } from 'react'
import styles from './WindowControls.module.css'

function WindowControlItem({
	children,
	className,
	...props
}: HTMLAttributes<HTMLDivElement>) {
	return (
		<div
			className={cn('flex items-center justify-center w-8 h-8', className)}
			{...props}
		>
			{children}
		</div>
	)
}
// fixed right-0 z-10
export function WindowControls() {
	return (
		<div
			className={cn('flex bg-secondary col-span-2 items-stretch', styles.root)}
		>
			<div className={cn('ml-3 w-3', styles.fill)} />

			<div className={cn('px-3', styles.brand)}>budgeted</div>
			<div className={cn('mr-3 grow', styles.fill)} />

			<WindowControlItem
				aria-label="Minimize"
				onClick={() => titlebar.api.minimize()}
			>
				<svg aria-hidden="false" width="10" height="10" viewBox="0 0 12 12">
					<rect fill="currentColor" width="10" height="1" x="1" y="6" />
				</svg>
			</WindowControlItem>

			<WindowControlItem
				aria-label="Restore down"
				onClick={() => titlebar.api.maximize()}
			>
				<svg aria-hidden="false" width="10" height="10" viewBox="0 0 12 12">
					<rect
						width="9"
						height="9"
						x="1.5"
						y="1.5"
						fill="none"
						stroke="currentColor"
					/>
				</svg>
			</WindowControlItem>

			<WindowControlItem
				aria-label="Close window"
				onClick={() => titlebar.api.close()}
			>
				<svg aria-hidden="false" width="10" height="10" viewBox="0 0 12 12">
					<polygon
						fill="currentColor"
						fillRule="evenodd"
						points="11 1.576 6.583 6 11 10.424 10.424 11 6 6.583 1.576 11 1 10.424 5.417 6 1 1.576 1.576 1 6 5.417 10.424 1"
					/>
				</svg>
			</WindowControlItem>
		</div>
	)
}
