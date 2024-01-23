import { trpc } from '@/lib/trpc'
import { PlaidLinkOnSuccess, PlaidLink } from 'react-plaid-link'

export function PlaidLinkPage() {
	const { data } = trpc.plaidLinkToken.useQuery()
	const { mutate } = trpc.setPlaidPublicToken.useMutation({})

	const onSuccess: PlaidLinkOnSuccess = function (publicToken) {
		console.log('onsuccess plaid')
		debugger
		mutate(publicToken)
	}

	return (
		data && (
			<PlaidLink token={data} onSuccess={onSuccess}>
				Link your bank account
			</PlaidLink>
		)
	)
}
