import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
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

export function useSearchParamsKey<T extends Zod.Schema<unknown>>(
	schema: T,
	key: string,
	defaultValue: z.infer<T>,
) {
	const [searchParams, setSearchParams] = useSearchParams()
	const value: z.infer<T> = useMemo(() => {
		const parsed = schema.safeParse(JSON.parse(searchParams.get(key) || 'null'))

		if (parsed.success) {
			return parsed.data as z.infer<T>
		} else {
			console.error(parsed.error)
			return defaultValue
		}
	}, [])

	const setValue = useCallback(
		(newValue: z.infer<T>) => {
			setSearchParams({ [key]: JSON.stringify(newValue) })
		},
		[key, setSearchParams],
	)

	return [value, setValue] as const
}
