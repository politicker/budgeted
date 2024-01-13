import { cn } from '@/lib/utils'
import { Switch } from '@headlessui/react'
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from './ui/card'
import { trpc } from '@/lib/trpc'
import { useState } from 'react'
import { Pencil1Icon } from '@radix-ui/react-icons'
import { Button } from './ui/button'
import { Input } from './ui/input'

// @ts-ignore
export function AccountsPage(props) {
	const { data, refetch } = trpc.accounts.useQuery()
	const [isEditing, setIsEditing] = useState(false)

	return (
		<div className="p-6">
			{data?.map((account) => (
				<Card className={cn('w-[380px]')} {...props}>
					<CardHeader>
						<CardTitle className="flex justify-between items-center">
							{isEditing ? (
								<Input
									type="text"
									className="font-bold"
									defaultValue={account.name}
									onChange={(e) => {}}
								/>
							) : (
								account.name
							)}

							<Button
								variant="ghost"
								size="icon"
								onClick={() => setIsEditing(!isEditing)}
							>
								<Pencil1Icon />
							</Button>
						</CardTitle>
						<CardDescription>{account.officialName}</CardDescription>
					</CardHeader>
					<CardContent className="grid gap-4">
						<div className=" flex items-center space-x-4 rounded-md border p-4">
							<div className="flex-1 space-y-1">
								<p className="text-sm font-medium leading-none">
									Current Balance
								</p>
								<p className="text-sm text-muted-foreground">
									{account.currentBalance}
								</p>
							</div>
						</div>
					</CardContent>
				</Card>
			))}
		</div>
	)
}
