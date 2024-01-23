import { trpc } from '@/lib/trpc'
import { Input } from './ui/input'
import { PlaidLinkButton } from './PlaidLinkPage'
import { Button } from './ui/button'
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from './ui/form'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

export function SettingsPage() {
	const { mutate /*, refetch*/ } = trpc.createConfig.useMutation({})
	const formSchema = z.object({
		plaidClientId: z.string(),
		plaidSecret: z.string(),
	})

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
	})

	function onSubmit(data: z.infer<typeof formSchema>) {
		mutate({
			plaidClientId: data.plaidClientId,
			plaidSecret: data.plaidSecret,
		})
	}

	return (
		<div className="flex flex-col gap-12 p-8 w-1/2">
			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
					<FormField
						control={form.control}
						name="plaidClientId"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Plaid Client ID</FormLabel>
								<FormControl>
									<Input placeholder="34534lkjjjkl345" {...field} />
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
									<Input placeholder="plaid-secret" {...field} />
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

			<PlaidLinkButton />
		</div>
	)
}
