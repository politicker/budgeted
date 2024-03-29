import { trpc } from '@/lib/trpc'
import { Slot } from '@radix-ui/react-slot'
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
	asChild,
}: {
	children: React.ReactNode
	onSuccess?: () => Promise<unknown>
	institutionId?: string
	asChild?: boolean
}) {
	const { data } = trpc.plaidLinkToken.useQuery({ institutionId })
	const { mutateAsync: create } = trpc.createPlaidInstitution.useMutation({})
	const { mutateAsync: update } = trpc.updatePlaidInstitution.useMutation({})

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
					? update({
							institutionId,
							accounts: metadata.accounts,
						})
					: create({
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

	const Comp = asChild ? Slot : 'div'
	return <Comp onClick={onClick}>{children}</Comp>
}
