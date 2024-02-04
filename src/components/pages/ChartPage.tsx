import { trpc } from '@/lib/trpc'
import { useDimensions } from '@/lib/useDimensions'
import { Fragment, useMemo, useRef, useState } from 'react'
import { sub, add, format } from 'date-fns'
import { Dialog, Transition } from '@headlessui/react'
import { Button } from '../ui/button'
import { InlineInput } from '../ui/input'
import { useLocalStorage } from '@/lib/useLocalStorage'
import { z } from 'zod'
import { colors } from '@/lib/colors'
import * as d3 from 'd3'
import { Axis } from '../graph/Axis'
import { Axis2 } from '../graph/Axis2'
import { BudgetChart } from '../graph/BudgetChart'

const DEFAULT_DAY_RANGE = 50
const DEFAULT_BUDGET = '$10,000'

function parseMoney(money: string) {
	return parseInt(money.replace(/\D/g, ''))
}

export function formatMoney(money: number) {
	return `$${money.toLocaleString()}`
}

export function ChartPage() {
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

	const minDate = useMemo(
		() => format(sub(new Date(), { days: dayRange }), 'yyyy-MM-dd'),
		[dayRange],
	)

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
				date: '',
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
			<div data-role="controls" className="p-3">
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

			<div className="row-span-2 rounded-md border overflow-hidden mx-3 mb-3 bg-background">
				{filteredData && (
					<BudgetChart
						filteredData={filteredData}
						budgetData={budgetData}
						date={date}
						setDate={setDate}
					/>
				)}

				<Transition show={Boolean(date) && !closeModal} as={Fragment}>
					<Dialog onClose={() => setCloseModal(true)}>
						<div
							className="fixed inset-0 bg-background/50 top-[24px]"
							aria-hidden="true"
							onClick={() => setCloseModal(true)}
						/>

						<Transition.Child
							className="transition-[right] fixed h-[calc(100vh_-_24px)] w-[350px] top-[24px] right-0 border-l bg-background grid grid-rows-[min-content_1fr_min-content]"
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
										className="p-3 border-b flex justify-between items-center gap-3"
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
