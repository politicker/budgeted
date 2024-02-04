import { useDimensions } from '@/lib/useDimensions'
import * as d3 from 'd3'
import { Dispatch, SetStateAction, useMemo, useState } from 'react'
import { Axis } from './Axis'
import { format } from 'date-fns'

const DEFAULT_WIDTH = 640
const DEFAULT_HEIGHT = 400

interface Datum {
	date: string
	amount: number
}

interface Props {
	filteredData: Datum[]
	budgetData: Datum[]
	date?: string
	setDate: Dispatch<SetStateAction<string | undefined>>
}

export function BudgetChart({
	filteredData,
	budgetData,
	date,
	setDate,
}: Props) {
	const [hoveredTick, setHoveredTick] = useState<string>()
	const [ref, dimensions] = useDimensions({ liveMeasure: true })

	const MARGIN = 20
	const marginTop = MARGIN
	const marginRight = 50
	const marginBottom = 50
	const marginLeft = 50
	const borderFix = 2
	const width = (dimensions.width ?? DEFAULT_WIDTH) - borderFix
	const height = (dimensions.height ?? DEFAULT_HEIGHT) - borderFix

	const x = useMemo(() => {
		if (!filteredData) return
		const ex = d3.extent(filteredData, (d) => new Date(d.date))
		if (!ex[0]) return

		return d3
			.scaleUtc()
			.domain(ex)
			.range([marginLeft, width - marginRight])
	}, [filteredData, marginLeft, width, marginRight])

	const y = useMemo(() => {
		if (!filteredData) return
		const ex = d3.extent(filteredData, (d) => d.amount)

		return d3
			.scaleLinear()
			.domain([0, Math.max(ex[1] ?? 0, budgetData[1]?.amount ?? 0)])
			.range([height - marginBottom, marginTop])
	}, [filteredData, budgetData, marginTop, height, marginBottom])

	if (!x || !y) return <div>loading</div>

	const line = d3.line<{ date: string; amount: number }>(
		(d) => (d.date === '' ? marginLeft - 15 : x(new Date(d.date))),
		(d) => (d.date === '' ? height - marginBottom : y(d.amount)),
	)

	return (
		<div ref={ref} className="w-full h-full">
			{'width' in dimensions && filteredData && (
				<svg width={width} height={height}>
					<Axis
						x={x}
						y={y}
						pad={15}
						format={(date) => format(date as Date, 'MMM d')}
						maxTicks={filteredData.length}
					/>

					<Axis
						x={x}
						y={y}
						placement="left"
						format={
							((amount: number) =>
								`$${amount > 1000 ? `${amount / 1000}k` : amount}`) as (
								value: number | Date,
							) => string
						}
					/>

					<path
						fill="none"
						stroke="currentColor"
						strokeWidth="1.5"
						d={line([{ date: '', amount: 0 }, ...filteredData]) ?? undefined}
						transform="translate(15,0)"
					/>

					<path
						fill="none"
						stroke="purple"
						strokeDasharray={'5,5'}
						strokeWidth="1.5"
						d={line(budgetData) ?? undefined}
						transform="translate(15,0)"
					/>

					{filteredData.map((d) => (
						<rect
							key={d.date}
							x={x(new Date(d.date)) ?? 0}
							y={0}
							width={30}
							height={height - marginBottom}
							fill={
								hoveredTick === d.date || date === d.date
									? 'purple'
									: 'transparent'
							}
							onMouseEnter={() => setHoveredTick(d.date)}
							onMouseLeave={() => setHoveredTick(undefined)}
							onClick={() => setDate(d.date)}
							opacity={0.1}
						/>
					))}
				</svg>
			)}
		</div>
	)
}
