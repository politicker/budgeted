import { trpc } from '@/lib/trpc'
import { Fragment, useMemo, useState } from 'react'
import { sub, add, format } from 'date-fns'
import { Dialog, Transition } from '@headlessui/react'
import { Button } from '../ui/button'
import { InlineInput } from '../ui/input'
import { useLocalStorage } from '@/lib/useLocalStorage'
import { z } from 'zod'
import { BudgetChart } from '../graph/BudgetChart'
import { formatMoney } from '@/lib/money'
import { parseMoney } from '@/lib/money'
import { useSearchParams } from 'react-router-dom'
import { NetWorthChart } from '../graph/NetWorthChart'

const DEFAULT_DAY_RANGE = 30

export function NetWorthPage() {
	const [date, setDate] = useState<string>()
	const [closeModal, setCloseModal] = useState(false)
	const { data } = trpc.accountBalances.useQuery()

	const [dayRange, setDayRange] = useLocalStorage(
		z.number(),
		'networth.dayRange',
		DEFAULT_DAY_RANGE,
	)

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const minDate = useMemo(
		() => format(sub(new Date(), { days: dayRange }), 'yyyy-MM-dd'),
		[dayRange],
	)

	const filteredData = useMemo(() => {
		if (!data) return null

		interface Datum {
			date: string
			amount: number
			name: string
		}

		const map: Record<string, Datum[]> = {}

		for (const datum of data.map((d) => ({
			date: format(new Date(d.createdAt), 'yyyy-MM-dd'),
			amount: d.current,
			name: d.account.name,
		}))) {
			const arr = map[datum.date] ?? []
			if (arr.find((m) => m.name === datum.name)) continue
			arr.push(datum)
			map[datum.date] = arr
		}

		const frames: { date: string; amount: number; data: Datum[] }[] = []

		for (const date in map) {
			const amount = map[date]?.reduce((a, b) => a + b.amount, 0) ?? 0
			frames.push({ date, amount, data: map[date] ?? [] })
		}

		return frames
	}, [data])

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
				days.
			</div>

			<div className="row-span-2 rounded-md border overflow-hidden mx-3 mb-3 bg-background">
				{filteredData && (
					<NetWorthChart
						filteredData={filteredData}
						date={date}
						setDate={setDate}
					/>
				)}
			</div>
		</>
	)
}
