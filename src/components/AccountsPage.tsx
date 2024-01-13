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
import { useRef, useState } from 'react'
import { Pencil1Icon } from '@radix-ui/react-icons'
import { Button } from './ui/button'
import { InlineInput, Input } from './ui/input'

// @ts-ignore
export function AccountsPage(props) {
	const { data, refetch } = trpc.accounts.useQuery()
	const { mutate } = trpc.setAccountName.useMutation({
		onSuccess: () => refetch(),
	})

	const [isEditing, setIsEditing] = useState(false)
	const accountNameRef = useRef<HTMLInputElement>(null)

	return (
		<div className="p-6">
			{data?.map((account) => (
				<Card className={cn('w-[380px]')} {...props}>
					<CardHeader>
						<CardTitle className="flex justify-between items-center ">
							{isEditing ? (
								<form
									onSubmit={(e) => {
										e.preventDefault()
										mutate({
											id: account.plaidId,
											name: accountNameRef.current
												? accountNameRef.current.value
												: account.name,
										})

										setIsEditing(false)
									}}
								>
									<InlineInput
										type="text"
										className="mx-[-9px] text-lg font-semibold leading-none tracking-tight"
										defaultValue={account.name}
										ref={accountNameRef}
									/>
								</form>
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
