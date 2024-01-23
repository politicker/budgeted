import { trpc } from '@/lib/trpc'
import { Input } from './ui/input'
import { PlaidLinkPage } from './PlaidLinkPage'

export function SettingsPage() {
	const { mutate /*, refetch*/ } = trpc.createConfig.useMutation({})

	function onSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault()

		const form = e.target as HTMLFormElement
		const formData = new FormData(form)

		const plaidClientId = formData.get('plaidClientId') as string
		const plaidSecret = formData.get('plaidSecret') as string

		mutate({
			plaidClientId,
			plaidSecret,
		})
	}

	return (
		<>
			<form onSubmit={onSubmit}>
				<p>Plaid Client ID </p>
				<Input type="text" name="plaidClientId" />

				<p>Plaid Secret </p>
				<Input type="text" name="plaidSecret" />

				<button type="submit">Submit</button>
			</form>

			<PlaidLinkPage />
		</>
	)
}
