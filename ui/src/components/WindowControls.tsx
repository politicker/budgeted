import { TitlebarContext } from '@/contexts/titlebar'
import { cn } from '@/lib/utils'
import { DragHandleDots1Icon } from '@radix-ui/react-icons'
import { HTMLAttributes } from 'react'

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

export function WindowControls() {
	return (
		<div className="fixed right-0 flex bg-secondary z-10 rounded-bl-sm">
			<WindowControlItem
				aria-label="Drag"
				className="[-webkit-user-select: none] [-webkit-app-region:drag] cursor-move"
			>
				<DragHandleDots1Icon />
			</WindowControlItem>
			<WindowControlItem
				aria-label="Minimize"
				onClick={() => TitlebarContext.minimize()}
			>
				<svg aria-hidden="false" width="10" height="10" viewBox="0 0 12 12">
					<rect fill="currentColor" width="10" height="1" x="1" y="6" />
				</svg>
			</WindowControlItem>

			<WindowControlItem
				aria-label="Restore down"
				onClick={() => TitlebarContext.maximize()}
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
				onClick={() => TitlebarContext.close()}
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
