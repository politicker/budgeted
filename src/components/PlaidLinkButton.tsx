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

		if (!data) {
			return
		}

		// TODO: Do we need to dig into accounts too?
		// I think we can push the user to the update flow
		// if they try to link an account that's already linked.
		// Maybe they'd do that if they want to add more bank accounts to an already-linked
		// institution.

		// Example: https://github.com/plaid/pattern/blob/master/server/routes/items.js#L41-L49
		for (const inst of data.institutions) {
			if (inst.plaidId === institution.institution_id) {
				toast.error(
					`Bank account already linked.
						Use the Link update flow to re-authenticate an already-linked account`,
				)
				return
			}
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
