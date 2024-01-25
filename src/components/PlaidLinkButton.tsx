import { trpc } from '@/lib/trpc'
import { PlaidLinkOnSuccess, PlaidLink } from 'react-plaid-link'
import { toast } from 'sonner'
import { Button } from './ui/button'

export function PlaidLinkButton() {
	const { data } = trpc.plaidLinkToken.useQuery()
	const { mutate } = trpc.setPlaidPublicToken.useMutation({})

	const onSuccess: PlaidLinkOnSuccess = function (publicToken, metadata) {
		const { institution } = metadata
		if (!institution) {
			return
		}

		mutate({
			publicToken,
			institutionName: institution.name,
			institutionId: institution.institution_id,
			accounts: metadata.accounts,
		})
		toast.success('Bank account linked')
	}

	return (
		data && (
			<div>
				<PlaidLink
					token={data.token}
					onSuccess={onSuccess}
					style={{
						padding: 'initial',
						outline: 'none',
						background: 'initial',
						border: 'initial',
						borderRadius: 'initial',
					}}
				>
					<Button asChild>
						<div>Link your bank account</div>
					</Button>
				</PlaidLink>
			</div>
		)
	)
}
