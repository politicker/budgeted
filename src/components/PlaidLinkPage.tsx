import { trpc } from '@/lib/trpc'
import { PlaidLinkOnSuccess, PlaidLink } from 'react-plaid-link'

export function PlaidLinkButton() {
	const { data } = trpc.plaidLinkToken.useQuery()
	const { mutate } = trpc.setPlaidPublicToken.useMutation({})

	const onSuccess: PlaidLinkOnSuccess = function (publicToken) {
		mutate(publicToken)
	}

	return (
		data && (
			<div>
				<PlaidLink token={data} onSuccess={onSuccess}>
					Link your bank account
				</PlaidLink>
			</div>
		)
	)
}
