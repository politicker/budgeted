import { Card, CardContent, CardHeader } from '../ui/card'
import { trpc } from '@/lib/trpc'
import { useEffect, useState } from 'react'
import { Link2Icon, Pencil1Icon, PlusIcon } from '@radix-ui/react-icons'
import { Button } from '../ui/button'
import { InlineInput } from '../ui/input'
import { Account } from '@prisma/client'
import { PlaidLinkButton } from '../PlaidLinkButton'
import { formatMoney } from './ChartPage'

export function AccountsPage() {
	const { data, refetch } = trpc.institutions.useQuery()

	return (
		<div className="overflow-y-auto">
			<div className="flex flex-wrap gap-4 p-4">
				{data?.map((institution) => (
					<Card className="w-[380px] flex flex-col" key={institution.name}>
						<CardHeader className="flex flex-row items-center">
							<div
								className="rounded-full w-4 h-4 bg-primary mr-2"
								style={{
									backgroundColor: institution.color ?? undefined,
									// backgroundImage: `url('data:image/jpeg;base64,${institution.logo}')`,
								}}
							/>
							<div style={{ margin: 0 }}>{institution.name}</div>
						</CardHeader>
						<CardContent className="flex flex-col gap-4 grow">
							<div>
								{institution.accounts.map((account) => (
									<AccountCard
										key={account.plaidId}
										account={account}
										onSuccess={refetch}
									/>
								))}
							</div>

							<PlaidLinkButton
								onSuccess={refetch}
								institutionId={institution.plaidId}
								asChild
							>
								<div className="grow flex items-end">
									<Button className="w-full" variant="outline" asChild>
										<div className="flex items-center gap-3">
											<Link2Icon />
											<div className="leading-3 pt-[2px]">
												Reconnect to Plaid
											</div>
										</div>
									</Button>
								</div>
							</PlaidLinkButton>
						</CardContent>
					</Card>
				))}

				<PlaidLinkButton onSuccess={refetch} asChild>
					<Card className="w-[380px] bg-muted hover:bg-secondary flex flex-col">
						<CardHeader className="text-center">Add an Institution</CardHeader>

						<CardContent className="flex items-center justify-center grow">
							<div>
								<PlusIcon className="w-[100px] h-[100px]" />
							</div>
						</CardContent>
					</Card>
				</PlaidLinkButton>
			</div>
		</div>
	)
}

interface AccountCardProps {
	onSuccess: () => Promise<unknown>
	account: Account
}

function AccountCard({ onSuccess, account }: AccountCardProps) {
	const { mutate } = trpc.setAccountName.useMutation({ onSuccess })

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
				<p className="text-muted-foreground">
					{account.currentBalance ? (
						formatMoney(account.currentBalance)
					) : (
						<i>(pending import)</i>
					)}
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
