import { trpc } from '@/lib/trpc'
import useDimensions from '@/lib/useDimensions'
import { useCallback, useEffect, useMemo, useState } from 'react'
import {
	VictoryLine,
	VictoryChart,
	VictoryAxis,
	VictoryLabel,
	VictoryBar,
	Line,
	Bar,
} from 'victory'
import { sub, add, format } from 'date-fns'
import { Dialog } from '@headlessui/react'
import { Button } from './ui/button'

const data = [
	{ quarter: 1, earnings: 13000 },
	{ quarter: 2, earnings: 16500 },
	{ quarter: 3, earnings: 14250 },
	{ quarter: 4, earnings: 19000 },
]

const DayRange = 50

export function TransactionsGraph() {
	const [ref, dimensions] = useDimensions({ liveMeasure: true })
	const [date, setDate] = useState<string>()
	const { data } = trpc.transactions.useQuery(
		{
			sort: 'asc',
			sortColumn: 'date',
			pageIndex: 0,
			pageSize: Infinity,
			minDate: format(sub(new Date(), { days: DayRange }), 'yyyy-MM-dd'),
		},
		{
			keepPreviousData: true,
		},
	)

	const filteredData = useMemo(() => {
		if (!data) return null
		let amount = 0

		const startDate = sub(new Date(), { days: DayRange })
		const frames = []
		const results = [...data.results]

		for (let i = 0; i < DayRange; i++) {
			const date = format(add(startDate, { days: i }), 'yyyy-MM-dd')
			const transactions = []

			while (results[0] && results[0].date === date) {
				const transaction = results.shift()
				if (!transaction) continue
				if (transaction.amount < 0) continue
				transactions.push(transaction)
				amount += transaction.amount
			}

			const frame = { date, amount, transactions }
			frames.push(frame)
		}

		return frames
	}, [data])

	const transactionsForDate = useMemo(() => {
		if (!date) return null
		if (!filteredData) return null
		const frame = filteredData.find((frame) => frame.date === date)
		if (!frame) return null
		return frame.transactions
	}, [date, filteredData])

	return (
		<>
			<div className="p-3 border-b">Controls</div>
			<div ref={ref} className="row-span-2">
				{'width' in dimensions && filteredData && (
					<VictoryChart
						// domainPadding will add space to each side of VictoryBar to
						// prevent it from overlapping the axis
						// domainPadding={20}
						domainPadding={{ y: [0, 0] }}
						width={dimensions.width}
						height={dimensions.height}
						padding={{ top: 20, bottom: 100, left: 50, right: 20 }}
					>
						<VictoryAxis
							tickLabelComponent={
								<VictoryLabel
									angle={-45}
									textAnchor="end"
									style={{ fill: '#444' }}
								/>
							}
							// // tickValues specifies both the number of ticks and where
							// // they are placed on the axis
							// tickValues={[1, 2, 3, 4]}
							// tickFormat={['Quarter 1', 'Quarter 2', 'Quarter 3', 'Quarter 4']}

							events={[
								{
									target: 'tickLabels',
									eventHandlers: {
										onMouseOver: () => {
											return [
												{
													target: 'tickLabels',
													mutation: () => ({ style: { fill: 'white' } }),
												},
												{
													target: 'grid',
													mutation: () => ({ style: { stroke: 'white' } }),
												},
											]
										},
										onMouseOut: () => {
											return [
												{
													target: 'tickLabels',
													mutation: () => ({ style: { fill: '#444' } }),
												},
												{
													target: 'grid',
													mutation: () => ({
														style: { stroke: 'rgba(0,0,0,0)' },
													}),
												},
											]
										},
										onClick: () => {
											return [
												{
													target: 'tickLabels',
													mutation: (tick: { text: string }) => {
														setDate(tick.text)
														return {}
													},
												},
											]
										},
									},
								},
							]}
							gridComponent={<Line style={{ stroke: 'rgba(0,0,0,0)' }} />}
						/>
						<VictoryAxis
							dependentAxis
							// tickFormat specifies how ticks should be displayed
							tickFormat={(x) => `$${x / 1000}k`}
						/>

						{/* <VictoryBar
							data={filteredData}
							x="date"
							y="amount"
							style={{
								data: { fill: 'tomato', width: 20 },
							}}
							events={[
								{
									target: 'data',
									eventHandlers: {
										onMouseOver: () => {
											return [
												{
													target: 'data',
													mutation: () => ({
														style: { fill: 'gold', width: 30 },
													}),
												},
												{
													target: 'labels',
													mutation: () => ({ active: true }),
												},
											]
										},
										onMouseOut: () => {
											return [
												{
													target: 'data',
													mutation: () => {},
												},
												{
													target: 'labels',
													mutation: () => ({ active: false }),
												},
											]
										},
									},
								},
							]}
						/> */}
						<VictoryLine data={filteredData} x="date" y="amount" />
					</VictoryChart>
				)}

				<Dialog open={Boolean(date)} onClose={() => setDate(undefined)}>
					<div className="fixed inset-0 bg-background/50" aria-hidden="true" />
					<Dialog.Panel>
						<div className="fixed h-[100vh] w-[300px] top-0 right-0 border-l bg-background grid grid-rows-[min-content_1fr_min-content]">
							<div className="p-3 border-b">{date}</div>
							<div className="overflow-y-auto">
								{transactionsForDate?.map((transaction) => (
									<div
										key={transaction.plaidId}
										className="p-3 border-b flex justify-between"
									>
										<div>{transaction.name}</div>
										<div>{transaction.amount}</div>
									</div>
								))}
							</div>
							<div className="p-3 border-t">
								{' '}
								<Button onClick={() => setDate(undefined)} variant="outline">
									Close
								</Button>
							</div>
						</div>
					</Dialog.Panel>
				</Dialog>
			</div>
		</>
	)
}
