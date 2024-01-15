import { useEffect, useState } from 'react'
import { z } from 'zod'

export function useLocalStorage<T extends Zod.Schema>(
	schema: T,
	key: string,
	defaultValue: z.infer<T>,
) {
	const [value, setValue] = useState<z.infer<T>>(() => {
		const json = localStorage.getItem(key)

		if (json) {
			const parsed = schema.safeParse(JSON.parse(json))
			if (parsed.success) {
				return parsed.data as typeof defaultValue
			} else {
				console.error(parsed.error)
				return defaultValue
			}
		} else {
			return defaultValue
		}
	})

	useEffect(() => {
		localStorage.setItem(key, JSON.stringify(value))
	}, [key, value])

	return [value, setValue] as const
}
