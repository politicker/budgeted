import { trpc } from '@/lib/trpc'
import { useDimensions } from '@/lib/useDimensions'
import { Fragment, useMemo, useState } from 'react'
import {
	VictoryLine,
	VictoryChart,
	VictoryAxis,
	VictoryLabel,
	LineSegment,
} from 'victory'
import { sub, add, format } from 'date-fns'
import { Dialog, Transition } from '@headlessui/react'
import { Button } from '../ui/button'
import { InlineInput } from '../ui/input'
import { useLocalStorage } from '@/lib/useLocalStorage'
import { z } from 'zod'
import { colors } from '@/lib/colors'

const DEFAULT_DAY_RANGE = 50
const DEFAULT_BUDGET = '$10,000'

function parseMoney(money: string) {
	return parseInt(money.replace(/\D/g, ''))
}

export function formatMoney(money: number) {
	return `$${money.toLocaleString()}`
}

export function ChartPage() {
	const [ref, dimensions] = useDimensions({ liveMeasure: true })
	const [date, setDate] = useState<string>()
	const [closeModal, setCloseModal] = useState(false)

	const [dayRange, setDayRange] = useLocalStorage(
		z.number(),
		'dayRange',
		DEFAULT_DAY_RANGE,
	)

	const [budget, setBudget] = useLocalStorage(
		z.string(),
		'budget',
		DEFAULT_BUDGET,
	)

	const minDate = useMemo(() => {
		return format(sub(new Date(), { days: dayRange }), 'yyyy-MM-dd')
	}, [dayRange])

	const { data, refetch } = trpc.transactions.useQuery(
		{
			sort: 'asc',
			sortColumn: 'date',
			pageIndex: 0,
			pageSize: Infinity,
			minDate,
			showHidden: false,
			rowSelection: {},
			sorting: [],
			selection: [],
			columnFilters: [],
			columnVisibility: {},
		},
		{
			keepPreviousData: true,
		},
	)

	const { mutate } = trpc.hideTransaction.useMutation({
		onSuccess: () => refetch(),
	})

	const filteredData = useMemo(() => {
		if (!data) return null
		let amount = 0

		const startDate = sub(new Date(), { days: dayRange })
		const frames = []
		const results = [...data.results]

		for (let i = 0; i < dayRange; i++) {
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
	}, [data, dayRange])

	const budgetData = useMemo(() => {
		if (!filteredData) return []
		const budgetValue = parseMoney(budget)
		const firstFrame = filteredData[0]
		if (!firstFrame) return []
		const lastFrame = filteredData[filteredData.length - 1]
		if (!lastFrame) return []

		return [
			{
				date: firstFrame.date,
				amount: 0,
			},
			{
				date: lastFrame.date,
				amount: budgetValue,
			},
		]
	}, [filteredData, budget])

	const transactionsForDate = useMemo(() => {
		if (!date) return null
		if (!filteredData) return null

		const frame = filteredData.find((frame) => frame.date === date)
		if (!frame) return null

		return frame.transactions
	}, [date, filteredData])

	return (
		<>
			<div className="p-3 border-b">
				<span>Showing</span> the last{' '}
				<InlineInput
					className="w-10 text-center"
					value={dayRange}
					onChange={(e) => {
						if (!e.target.value) {
							setDayRange(0)
							return
						}

						const value = parseInt(e.target.value)
						if (isNaN(value)) return

						setDayRange(value)
					}}
				/>{' '}
				days. Budget:{' '}
				<InlineInput
					className="w-20 text-right"
					value={budget}
					onChange={(e) => {
						if (!e.target.value) {
							return setBudget(DEFAULT_BUDGET)
						}

						const value = parseMoney(e.target.value)
						if (isNaN(value)) {
							return setBudget(DEFAULT_BUDGET)
						}

						setBudget(formatMoney(value))
					}}
				/>
			</div>

			<div ref={ref} className="row-span-2">
				{'width' in dimensions && filteredData && (
					<VictoryChart
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
									style={{ fill: colors.secondary.DEFAULT }}
								/>
							}
							events={[
								{
									target: 'tickLabels',
									eventHandlers: {
										onMouseOver: () => {
											return [
												{
													target: 'tickLabels',
													mutation: () => ({
														style: { fill: colors.secondary.foreground },
													}),
												},
												{
													target: 'grid',
													mutation: () => ({
														style: { stroke: colors.secondary.foreground },
													}),
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
							gridComponent={
								<LineSegment style={{ stroke: 'rgba(0,0,0,0)' }} />
							}
						/>
						<VictoryAxis
							dependentAxis
							// tickFormat specifies how ticks should be displayed
							tickFormat={(x) => `$${x / 1000}k`}
						/>

						<VictoryLine data={filteredData} x="date" y="amount" />
						<VictoryLine
							data={budgetData}
							x="date"
							y="amount"
							style={{
								data: {
									stroke: colors.destructive.DEFAULT,
									strokeDasharray: '4',
								},
							}}
						/>
					</VictoryChart>
				)}

				<Transition show={Boolean(date) && !closeModal} as={Fragment}>
					<Dialog onClose={() => setCloseModal(true)}>
						<div
							className="fixed inset-0 bg-background/50"
							aria-hidden="true"
							onClick={() => setCloseModal(true)}
						/>

						<Transition.Child
							className="transition-[right] fixed h-[100vh] min-w-[300px] w-[75%] top-0 right-0 border-l bg-background grid grid-rows-[min-content_1fr_min-content]"
							enterFrom="right-[-100%]"
							enter="right-0"
							leave="right-[-100%]"
							afterLeave={() => {
								setDate(undefined)
								setCloseModal(false)
							}}
						>
							<div className="p-3 border-b">{date}</div>
							<div className="overflow-y-auto">
								{transactionsForDate?.map((transaction) => (
									<div
										key={transaction.plaidId}
										className="p-3 border-b flex justify-between items-center"
									>
										<div>{transaction.name}</div>
										<div className="flex items-center">
											<div>{formatMoney(transaction.amount)}</div>
											<Button
												size="sm"
												variant="destructive"
												className="ml-3"
												onClick={() => mutate({ plaidId: transaction.plaidId })}
											>
												Hide
											</Button>
										</div>
									</div>
								))}
							</div>
							<div className="p-3 border-t flex justify-between items-center">
								<Button onClick={() => setCloseModal(true)} variant="outline">
									Close
								</Button>
								<div>
									Total:{' '}
									{formatMoney(
										transactionsForDate?.reduce((a, b) => a + b.amount, 0) ?? 0,
									)}
								</div>
							</div>
						</Transition.Child>
					</Dialog>
				</Transition>
			</div>
		</>
	)
}
