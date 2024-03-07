'use client'
import { InlineInput } from '@/components/ui/input'

interface Props {
	dayRange: number
	setDayRange: (value: number) => void
}

export function DayRangeInput({ dayRange, setDayRange }: Props) {
	return (
		<div>
			<span>Showing</span> the last
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
	)
}
