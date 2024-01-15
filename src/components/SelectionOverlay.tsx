import { Transaction } from '@prisma/client'
import { Card, CardHeader, CardTitle } from './ui/card'

interface Props {
	selectedRows: Transaction[]
}

export function SelectionOverlay({ selectedRows }: Props) {
	let sum = 0

	sum = selectedRows.reduce((acc, row) => {
		return acc + row.amount
	}, 0)

	return (
		<div className="absolute right-10 bottom-20">
			<Card>
				<CardHeader>
					<CardTitle>${sum.toFixed(2)}</CardTitle>
				</CardHeader>
			</Card>
		</div>
	)
}
