import React from 'react'
import type { Transaction } from '@prisma/client'
import { ColumnDef } from '@tanstack/react-table'

export const transactionColumns: ColumnDef<Transaction>[] = [
	{
		header: 'Icon',
		accessorFn: (row) => row.logoUrl ?? row.categoryIconUrl,
		cell: (ctx) => {
			const value = ctx.getValue()
			if (!value || typeof value !== 'string') return null
			return <img src={value} alt="icon" className="max-w-8" />
		},
	},
	{
		header: 'Date',
		accessorKey: 'date',
	},
	{
		header: 'Amount',
		accessorKey: 'amount',
	},
	{
		header: 'Name',
		accessorKey: 'name',
	},
	{
		header: 'Merchant',
		accessorKey: 'merchantName',
	},
	{
		header: 'City',
		accessorKey: 'city',
	},
	{
		header: 'Category',
		accessorKey: 'category',
	},
]
