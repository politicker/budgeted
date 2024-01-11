import { trpc } from '@/lib/trpc'
import useDimensions from '@/lib/useDimensions'
import { useCallback, useEffect, useMemo } from 'react'
import { VictoryLine, VictoryChart, VictoryAxis } from 'victory'
import { sub, format } from 'date-fns'
import CanvasJSReact from '@canvasjs/react-charts'
//var CanvasJSReact = require('@canvasjs/react-charts');

var CanvasJS = CanvasJSReact.CanvasJS
var CanvasJSChart = CanvasJSReact.CanvasJSChart

const data = [
	{ quarter: 1, earnings: 13000 },
	{ quarter: 2, earnings: 16500 },
	{ quarter: 3, earnings: 14250 },
	{ quarter: 4, earnings: 19000 },
]

export function TransactionsGraph() {
	const [ref, dimensions] = useDimensions({ liveMeasure: true })
	const { data } = trpc.transactions.useQuery(
		{
			sort: 'asc',
			sortColumn: 'date',
			pageIndex: 0,
			pageSize: Infinity,
			minDate: format(sub(new Date(), { months: 1 }), 'yyyy-MM-dd'),
		},
		{
			keepPreviousData: true,
		},
	)

	const filteredData = useMemo(() => {
		if (!data) return null
		let total = 0

		return data.results
			.filter((d) => d.amount > 0)
			.map((d) => {
				total += d.amount
				return {
					date: d.date,
					amount: total,
				}
			})
	}, [data])

	return (
		<div ref={ref} className="row-span-3">
			{'width' in dimensions && filteredData && (
				<VictoryChart
					// domainPadding will add space to each side of VictoryBar to
					// prevent it from overlapping the axis
					domainPadding={20}
					width={dimensions.width}
					height={dimensions.height}
				>
					<VictoryAxis
					// // tickValues specifies both the number of ticks and where
					// // they are placed on the axis
					// tickValues={[1, 2, 3, 4]}
					// tickFormat={['Quarter 1', 'Quarter 2', 'Quarter 3', 'Quarter 4']}
					/>
					<VictoryAxis
						dependentAxis
						// tickFormat specifies how ticks should be displayed
						tickFormat={(x) => `$${x / 1000}k`}
					/>
					<VictoryLine data={filteredData} x="date" y="amount" />
				</VictoryChart>
			)}
		</div>
	)
}
