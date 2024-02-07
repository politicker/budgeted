import * as d3 from 'd3'
import { useMemo } from 'react'

type Props = {
	// scale MUST be memoized
	x: d3.ScaleLinear<number, number> | d3.ScaleTime<number, number>
	y: d3.ScaleLinear<number, number>
	pixelsPerTick?: number
	placement?: 'top' | 'bottom' | 'left' | 'right'
	setHoveredTick?: React.Dispatch<
		React.SetStateAction<Date | number | undefined>
	>
	hoveredTick?: string
	pad?: number
	format?: ((value: number | Date) => string) | string
	maxTicks?: number
}

export function Axis({
	x,
	y,
	pixelsPerTick = 30,
	placement = 'bottom',
	setHoveredTick,
	pad,
	format = (value) => value.toString(),
	maxTicks = Infinity,
}: Props) {
	const axis = placement === 'bottom' || placement === 'top' ? 'x' : 'y'
	const main = axis === 'x' ? x : y
	const r = main.range() as [number, number]
	const range = [r[0], r[1] + (pad ?? 0) * 2] as const
	const scale = axis === 'x' ? x : y

	const rangeX = x.range() as [number, number]
	const rangeY = y.range() as [number, number]

	const ticks = useMemo(() => {
		const span = Math.abs(range[1] - range[0])
		const numberOfTicksTarget = Math.min(
			Math.max(1, Math.floor(span / pixelsPerTick)),
			maxTicks,
		)

		const formatter =
			typeof format === 'string'
				? scale.tickFormat(numberOfTicksTarget, format)
				: typeof format === 'function'
					? format
					: scale.tickFormat(numberOfTicksTarget)

		return main.ticks(numberOfTicksTarget).map((value) => ({
			label: formatter(value as Date /* 😔 */),
			value: value,
			x: axis === 'x' ? x(value) + (pad ?? 0) : 0,
			y: axis === 'y' ? y(value) + (pad ?? 0) : 0,
		}))
	}, [main])

	const line = d3.line<number>(
		(x) => (axis === 'x' ? x : 0),
		(y) => (axis === 'y' ? y : 0),
	)(range)

	const translateX = axis === 'x' ? 0 : rangeX[0]
	const translateY = axis === 'y' ? 0 : rangeY[0]

	const tickTransform =
		axis === 'x'
			? 'translateX(-3px) translateY(15px) rotate(45deg)'
			: 'translateX(-10px) translateY(3px)'

	return (
		<g transform={`translate(${translateX}, ${translateY})`}>
			<path d={line ?? undefined} fill="none" stroke="currentColor" />

			{ticks.map(({ label, value, x, y }) => (
				<g
					key={value.toString()}
					transform={`translate(${x}, ${y})`}
					onMouseDown={setHoveredTick && (() => setHoveredTick(value))}
				>
					<line
						stroke="currentColor"
						{...(axis === 'x' ? { y2: '6' } : { x2: '-6' })}
					/>
					<text
						style={{
							fontSize: '10px',
							textAnchor: axis === 'x' ? 'start' : 'end',
							transform: tickTransform,
						}}
						fill="currentColor"
					>
						{label}
					</text>
				</g>
			))}
		</g>
	)
}
