import { useDimensions } from '@/lib/useDimensions'
import * as d3 from 'd3'
import { useMemo } from 'react'
import { Axis } from './Axis'
import { format, set } from 'date-fns'
import { formatMoneyK } from '@/lib/money'

const DEFAULT_WIDTH = 640
const DEFAULT_HEIGHT = 400

interface Datum {
	date: string
	amount: number
	// name: string
	data: {
		amount: number
		name: string
	}[]
}

interface Props {
	data: Datum[]
	setAccount?: React.Dispatch<React.SetStateAction<string | undefined>>
	account?: string
}

export function NetWorthChart({ data, account, setAccount }: Props) {
	const [ref, dimensions] = useDimensions({ liveMeasure: true })

	const MARGIN = 20
	const marginTop = MARGIN
	const marginRight = 50
	const marginBottom = 50
	const marginLeft = 50
	const borderFix = 2
	const width = (dimensions.width ?? DEFAULT_WIDTH) - borderFix
	const height = (dimensions.height ?? DEFAULT_HEIGHT) - borderFix

	const series = useMemo(
		() =>
			d3
				.stack<Datum>()
				.keys(d3.union(...data.map((d) => d.data.map((d) => d.name))))
				.value(
					(datum, key) => datum.data.find((d) => d.name === key)?.amount ?? 0,
				)(data),
		[data],
	)

	const x = useMemo(() => {
		if (!data) return
		const ex = d3.extent(data, (d) => new Date(d.date))
		if (!ex[0]) return

		return d3
			.scaleUtc()
			.domain(ex)
			.range([marginLeft, width - marginRight])
	}, [data, marginLeft, width, marginRight])

	const y = useMemo(() => {
		if (!data) return
		const ex = d3.extent(data, (d) => d.amount)

		return d3
			.scaleLinear()
			.domain([0, ex[1] ?? 0])
			.range([height - marginBottom, marginTop])
	}, [data, marginTop, height, marginBottom])

	const maxTicks = useMemo(() => {
		const first = data[0]
		const last = data[data.length - 1]
		if (!first || !last) return 30

		const firstDate = new Date(first.date)
		const lastDate = new Date(last.date)
		const days =
			Math.abs(
				set(lastDate, {
					hours: 0,
					minutes: 0,
					seconds: 0,
					milliseconds: 0,
				}).getTime() -
					set(firstDate, {
						hours: 0,
						minutes: 0,
						seconds: 0,
						milliseconds: 0,
					}).getTime(),
			) /
			(1000 * 60 * 60 * 24)
		return Math.min(30, days)
	}, [data])

	if (!x || !y) return <div>loading</div>

	const area = d3
		.area<d3.SeriesPoint<Datum>>()
		.x((d) => x(new Date(d.data.date)))
		.y0((d) => y(d[0]))
		.y1((d) => y(d[1]))

	return (
		<div ref={ref} className="w-full h-full">
			{'width' in dimensions && data && (
				<svg width={width} height={height}>
					<Axis
						x={x}
						y={y}
						format={(date) => format(date as Date, 'MMM d')}
						maxTicks={maxTicks}
					/>

					<Axis x={x} y={y} placement="left" format={formatMoneyK} />

					{series.map((s) => (
						<path
							key={s.key}
							fill="purple"
							stroke="purple"
							strokeWidth="0.1"
							opacity={account === s.key ? 1 : 0.5}
							onMouseEnter={() => setAccount?.(s.key)}
							onMouseLeave={() => setAccount?.(undefined)}
							d={area(s) ?? undefined}
						/>
					))}
				</svg>
			)}
		</div>
	)
}
