import { trpc } from '@/lib/trpc'
import { useCallback } from 'react'
import type {
	PlaidLinkOptions,
	PlaidHandler,
	PlaidEmbeddedHandler,
} from 'react-plaid-link'
import { toast } from 'sonner'

export interface Plaid extends PlaidHandler {
	create: (config: PlaidLinkOptions) => PlaidHandler
	createEmbedded: (
		config: PlaidLinkOptions,
		domTarget: HTMLElement,
	) => PlaidEmbeddedHandler
}

declare global {
	interface Window {
		Plaid: Plaid
	}
}

export function PlaidLinkButton({
	children,
	onSuccess,
	institutionId,
}: {
	children: React.ReactNode
	onSuccess?: () => Promise<unknown>
	institutionId?: string
}) {
	const { data } = trpc.plaidLinkToken.useQuery({ institutionId })
	const { mutateAsync } = trpc.setPlaidPublicToken.useMutation({})
	const { mutateAsync: mutateInstitution } =
		trpc.updatePlaidInstitution.useMutation({})

	const onClick = useCallback(() => {
		if (!data) {
			toast.error('Not ready yet')
			return
		}

		const handler = window.Plaid.create({
			token: data?.token,
			onSuccess: (publicToken, metadata) => {
				const { institution } = metadata
				if (!institution) {
					return
				}

				const promise = institutionId
					? mutateInstitution({
							institutionId,
							accounts: metadata.accounts,
						})
					: mutateAsync({
							publicToken,
							institutionName: institution.name,
							institutionId: institution.institution_id,
							accounts: metadata.accounts,
						})

				promise
					.then((result) => {
						if (result.success) {
							void onSuccess?.()
							toast.success('Bank account linked')
						} else {
							toast.error('Failed to link account')
						}
					})
					.catch(() => {
						toast.error('Something went wrong. Please try again')
					})
			},
		})

		handler.open()
	}, [data?.token])

	return <div onClick={onClick}>{children}</div>
}
