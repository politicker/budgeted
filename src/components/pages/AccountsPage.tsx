import { cn } from '@/lib/utils'
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '../ui/card'
import { trpc } from '@/lib/trpc'
import { useRef, useState } from 'react'
import { Pencil1Icon } from '@radix-ui/react-icons'
import { Button } from '../ui/button'
import { InlineInput } from '../ui/input'

export function AccountsPage() {
	const { data, refetch } = trpc.institutions.useQuery()
	const { mutate } = trpc.setAccountName.useMutation({
		onSuccess: () => refetch(),
	})

	const [isEditing, setIsEditing] = useState(false)
	const accountNameRef = useRef<HTMLInputElement>(null)

	return (
		<div className="p-6">
			{data?.map((institution, idx) => (
				<Card className={cn('w-[380px]')} key={idx}>
					<CardHeader></CardHeader>
					<CardContent className="grid gap-4">
						{institution.accounts.map((account, idx) => (
							<div
								key={idx}
								className="-mx-2 flex items-start space-x-4 rounded-md p-2 transition-all hover:bg-accent hover:text-accent-foreground"
							>
								<div className="space-y-1">
									<p className="text-sm font-medium leading-none">
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
									</p>
									<p className="text-sm text-muted-foreground">
										{account.currentBalance}
									</p>
									<Button
										variant="ghost"
										size="icon"
										onClick={() => setIsEditing(!isEditing)}
									>
										<Pencil1Icon />
									</Button>
								</div>
							</div>
						))}
					</CardContent>
				</Card>
			))}
		</div>
	)
}
