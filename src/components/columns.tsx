import { cn } from '@/lib/utils'
import { ColumnDef } from '@tanstack/react-table'
import type { fetchTransactions } from '../../electron/main/models/transactions'
import { formatMoney } from './pages/ChartPage'
import { Badge } from './ui/badge'
import { Checkbox } from './ui/checkbox'
import { DataTableColumnHeader } from './ui/data-table/data-table-column-header'

type TransactionType = Awaited<
	ReturnType<typeof fetchTransactions>
>['results'][0]

export const transactionColumns: ColumnDef<TransactionType>[] = [
	{
		id: 'select',
		accessorKey: 'plaidId',
		header: ({ table }) => (
			<Checkbox
				checked={
					table.getIsAllPageRowsSelected() ||
					(table.getIsSomePageRowsSelected() && 'indeterminate')
				}
				onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
				aria-label="Select all"
				className="text-2xl data-[state=checked]:translate-y-[2px] data-[state=indeterminate]:translate-y-[2px]"
			/>
		),
		cell: ({ row }) => (
			<Checkbox
				checked={row.getIsSelected()}
				onCheckedChange={(value) => row.toggleSelected(!!value)}
				aria-label="Select row"
				className="data-[state=checked]:translate-y-[2px]"
			/>
		),
		enableSorting: false,
		enableHiding: false,
	},
	{
		id: 'icon',
		accessorFn: (row) => row.logoUrl || row.categoryIconUrl,
		header: () => <span>Icon</span>,
		cell: (ctx) => {
			const value = ctx.getValue()
			if (!value || typeof value !== 'string') return null
			return (
				<img
					src={value}
					alt="icon"
					className={cn(
						'max-w-8',
						Boolean(ctx.row.original.logoUrl) && 'rounded-full',
					)}
				/>
			)
		},
	},
	{
		header: ({ column }) => {
			return <DataTableColumnHeader column={column} title="Date" />
		},
		accessorKey: 'date',
	},
	{
		header: ({ column }) => {
			return <DataTableColumnHeader column={column} title="Amount" />
		},
		id: 'amount',
		accessorFn: (row) => formatMoney(row.amount),
	},
	{
		id: 'name',
		accessorFn: (row) =>
			row.name
				.split(/\s/)
				.map((word) => word[0]?.toUpperCase() + word.slice(1).toLowerCase())
				.join(' '),
		accessorKey: 'name',
		header: ({ column }) => {
			return <DataTableColumnHeader column={column} title="Name" />
		},
	},
	{
		header: ({ column }) => {
			return <DataTableColumnHeader column={column} title="Merchant Name" />
		},
		accessorKey: 'merchantName',
	},
	{
		id: 'account',
		header: () => 'Account',
		accessorFn: (row) => row.account?.name,
		enableColumnFilter: true,
	},
	{
		header: ({ column }) => {
			return <DataTableColumnHeader column={column} title="City" />
		},
		accessorKey: 'city',
	},
	{
		header: () => {
			return <span>Category</span>
		},
		accessorKey: 'category',
		cell: ({ row }) => {
			return (
				<div className="flex space-x-1">
					{row.original.category.split(',').map((category, idx) => (
						<Badge variant="outline" className="bg-background" key={idx}>
							<span>{category}</span>
						</Badge>
					))}
				</div>
			)
		},
	},
]
