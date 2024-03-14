import { trpc } from '@/lib/trpc'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '../ui/form'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'

import { CreateConfigInput } from '~electron/main/api-inputs'

function SettingsForm({
	defaultValues,
}: {
	defaultValues: { plaidClientId: string; plaidSecret: string }
}) {
	console.log('SettingsForm', defaultValues)
	const { mutateAsync } = trpc.createConfig.useMutation({})

	const form = useForm<z.infer<typeof CreateConfigInput>>({
		resolver: zodResolver(CreateConfigInput),
		defaultValues,
	})

	async function onSubmit(data: z.infer<typeof CreateConfigInput>) {
		const result = await mutateAsync({
			plaidClientId: data.plaidClientId,
			plaidSecret: data.plaidSecret,
		})

		if (result.success) {
			toast.success('Settings saved')
		} else {
			toast.error('Error saving settings')
		}
	}

	return (
		<Form {...form}>
			<form
				onSubmit={(...args) => void form.handleSubmit(onSubmit)(...args)}
				className="space-y-8"
			>
				<FormField
					control={form.control}
					name="plaidClientId"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Plaid Client ID</FormLabel>
							<FormControl>
								<Input {...field} />
							</FormControl>
							<FormDescription>
								The Plaid Client ID from the devtools dashboard
							</FormDescription>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="plaidSecret"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Plaid Secret</FormLabel>
							<FormControl>
								<Input {...field} />
							</FormControl>
							<FormDescription>
								The Plaid Secret from the devtools dashboard
							</FormDescription>
							<FormMessage />
						</FormItem>
					)}
				/>

				<Button type="submit">Submit</Button>
			</form>
		</Form>
	)
}

export function SettingsPage() {
	const { data, status } = trpc.config.useQuery()
	const { mutate: rebuildTransactions } = trpc.rebuildTransactions.useMutation()
	const { mutate: writeCronTab } = trpc.writeCronTasks.useMutation()
	const defaultValues = data || {
		plaidClientId: '',
		plaidSecret: '',
	}
	// console.log('SettingsPage', defaultValues, data, rest)

	return (
		<div className="flex flex-col gap-12 p-8 w-1/2">
			{status === 'success' && <SettingsForm defaultValues={defaultValues} />}
			<Button onClick={() => rebuildTransactions()}>
				Rebuild Transactions
			</Button>
			<Button onClick={() => writeCronTab()}>Write to crontab</Button>
		</div>
	)
}
