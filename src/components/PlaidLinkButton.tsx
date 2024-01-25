import { trpc } from '@/lib/trpc'
import { PlaidLinkOnSuccess, PlaidLink } from 'react-plaid-link'
import { toast } from 'sonner'
import { Button } from './ui/button'

export function PlaidLinkButton() {
	const { data } = trpc.plaidLinkToken.useQuery()
	const { mutate } = trpc.setPlaidPublicToken.useMutation({})
	console.log({ data })

	const onSuccess: PlaidLinkOnSuccess = function (publicToken) {
		mutate(publicToken)
		toast.success('Bank account linked')
	}

	return (
		data && (
			<div>
				<PlaidLink
					token={data}
					onSuccess={onSuccess}
					style={{
						padding: 'initial',
						outline: 'none',
						background: 'initial',
						border: 'initial',
						borderRadius: 'initial',
					}}
				>
					<Button>Link your bank account</Button>
				</PlaidLink>
			</div>
		)
	)
}
