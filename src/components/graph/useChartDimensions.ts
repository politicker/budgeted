import { ResizeObserver } from '@juggle/resize-observer'
import { useEffect, useRef, useState } from 'react'

function combineChartDimensions(dimensions: {
	width: number
	height: number
	marginTop?: number
	marginRight?: number
	marginBottom?: number
	marginLeft?: number
}) {
	const parsedDimensions = {
		...dimensions,
		marginTop: dimensions.marginTop || 10,
		marginRight: dimensions.marginRight || 10,
		marginBottom: dimensions.marginBottom || 40,
		marginLeft: dimensions.marginLeft || 75,
	}
	return {
		...parsedDimensions,
		boundedHeight: Math.max(
			parsedDimensions.height -
				parsedDimensions.marginTop -
				parsedDimensions.marginBottom,
			0,
		),
		boundedWidth: Math.max(
			parsedDimensions.width -
				parsedDimensions.marginLeft -
				parsedDimensions.marginRight,
			0,
		),
	}
}
export function useChartDimensions(
	passedSettings: Parameters<typeof combineChartDimensions>[0],
) {
	const ref = useRef<SVGElement>()
	const dimensions = combineChartDimensions(passedSettings)

	const [width, setWidth] = useState(0)
	const [height, setHeight] = useState(0)

	useEffect(() => {
		if (dimensions.width && dimensions.height) return
		if (!ref.current) return

		const element = ref.current
		const resizeObserver = new ResizeObserver((entries) => {
			if (!Array.isArray(entries)) return
			if (!entries.length) return
			if (!entries[0]) return

			const entry = entries[0]

			if (width != entry.contentRect.width) setWidth(entry.contentRect.width)
			if (height != entry.contentRect.height)
				setHeight(entry.contentRect.height)
		})
		resizeObserver.observe(element)

		return () => {
			resizeObserver.unobserve(element)
		}
	}, [])

	const newSettings = combineChartDimensions({
		...dimensions,
		width: dimensions.width || width,
		height: dimensions.height || height,
	})

	return [ref, newSettings]
}
