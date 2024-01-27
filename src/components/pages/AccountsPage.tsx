import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader } from '../ui/card'
import { trpc } from '@/lib/trpc'
import { useEffect, useRef, useState } from 'react'
import { Pencil1Icon } from '@radix-ui/react-icons'
import { Button } from '../ui/button'
import { InlineInput } from '../ui/input'
import { Account } from '@prisma/client'

export function AccountsPage() {
	const { data, refetch } = trpc.institutions.useQuery()

	return (
		<div className="overflow-y-auto">
			<div className="flex flex-wrap gap-4 p-4">
				{data?.map((institution, idx) => (
					<Card className={cn('w-[380px]')} key={idx}>
						<CardHeader>{institution.name}</CardHeader>
						<CardContent className="grid gap-4">
							{institution.accounts.map((account) => (
								<AccountCard
									key={account.plaidId}
									account={account}
									refetch={refetch}
								/>
							))}
						</CardContent>
					</Card>
				))}
			</div>
		</div>
	)
}

interface AccountCardProps<T> {
	refetch: () => Promise<T>
	account: Account
}

function AccountCard<T>({ refetch, account }: AccountCardProps<T>) {
	const { mutate } = trpc.setAccountName.useMutation({
		onSuccess: () => refetch(),
	})

	const [isEditing, setIsEditing] = useState(false)
	const [accountNameRef, setRef] = useState<HTMLInputElement | null>(null)

	useEffect(() => {
		if (accountNameRef && isEditing) {
			accountNameRef.focus()
		}
	}, [accountNameRef, isEditing])

	return (
		<div className="-mx-2 flex items-start justify-between space-x-4 rounded-md p-3 transition-all border border-transparent hover:border-gray-400">
			<div className="space-y-1">
				<p className="text-lg">
					{isEditing ? (
						<form
							onSubmit={(e) => {
								e.preventDefault()
								mutate({
									id: account.plaidId,
									name: accountNameRef ? accountNameRef.value : account.name,
								})

								setIsEditing(false)
							}}
						>
							<InlineInput
								type="text"
								className="mx-[-9px] text-lg leading-none"
								defaultValue={account.name}
								ref={setRef}
							/>
						</form>
					) : (
						account.name
					)}
				</p>
				<p className="text-sm text-muted-foreground">
					{account.currentBalance}
				</p>
			</div>
			<Button
				variant="ghost"
				size="icon"
				onClick={() => setIsEditing(!isEditing)}
			>
				<Pencil1Icon />
			</Button>
		</div>
	)
}
