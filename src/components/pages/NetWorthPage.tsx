import { trpc } from '@/lib/trpc'
import { useMemo, useState } from 'react'
import { sub, format } from 'date-fns'
import { InlineInput } from '../ui/input'
import { useLocalStorage } from '@/lib/useLocalStorage'
import { z } from 'zod'
import { NetWorthChart } from '../graph/NetWorthChart'
import { formatMoneyK } from '@/lib/money'
import { cn } from '@/lib/utils'

const DEFAULT_DAY_RANGE = 30

export function NetWorthPage() {
	const [account, setAccount] = useState<string>()
	const { data } = trpc.accountBalances.useQuery()

	const [dayRange, setDayRange] = useLocalStorage(
		z.number(),
		'networth.dayRange',
		DEFAULT_DAY_RANGE,
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
			date: format(new Date(d.date), 'yyyy-MM-dd'),
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

		return frames.sort(
			(a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
		)
	}, [data])

	const accounts = useMemo(() => {
		if (!filteredData) return []
		const last = filteredData[filteredData.length - 1]
		if (!last) return []

		return last.data
	}, [filteredData])

	const sum = accounts.reduce((a, b) => a + b.amount, 0)

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

			<div className="h-full w-full row-span-2 grid grid-cols-[300px_1fr] grid-rows-[300px_1fr]">
				<div className="rounded-md border bg-background ml-3 mb-3 p-3 text-[80px] justify-center flex items-center">
					<div>
						{formatMoneyK(filteredData?.[filteredData.length - 1]?.amount ?? 0)}
					</div>
				</div>
				<div className="row-span-2 rounded-md border overflow-hidden mx-3 mb-3 bg-background">
					{filteredData && (
						<NetWorthChart
							data={filteredData}
							account={account}
							setAccount={setAccount}
						/>
					)}
				</div>
				<div className="rounded-md border bg-background ml-3 mb-3 p-3">
					{accounts.map((ac) => (
						<div
							key={ac.name}
							className={cn(
								'flex justify-between items-center bg-[purple] border-t border-black p-3',
								ac.name === account ? 'opacity-100' : 'opacity-50',
							)}
							style={{ height: `calc(${(ac.amount / sum) * 100}%)` }}
							onMouseEnter={() => setAccount(ac.name)}
							onMouseLeave={() => setAccount(undefined)}
						>
							<span>{ac.name}</span>
							<span>{formatMoneyK(ac.amount)}</span>
						</div>
					))}
				</div>
			</div>
		</>
	)
}
