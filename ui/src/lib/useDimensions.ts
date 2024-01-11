// https://github.com/Swizec/useDimensions/tree/master

import {
	useState,
	useLayoutEffect,
	useRef,
	MutableRefObject,
	RefObject,
	useEffect,
	useCallback,
} from 'react'

export interface DimensionObject {
	width: number
	height: number
	top: number
	left: number
	x: number
	y: number
	right: number
	bottom: number
}

export type UseDimensionsHook = [
	(node: HTMLDivElement) => void,
	DimensionObject | {},
	HTMLDivElement | null,
]

export interface UseDimensionsArgs {
	liveMeasure?: boolean
}
function getDimensionObject(node: HTMLDivElement): DimensionObject {
	const rect = node.getBoundingClientRect()

	return {
		width: rect.width,
		height: rect.height,
		top: rect.top,
		left: rect.left,
		x: rect.x,
		y: rect.y,
		right: rect.right,
		bottom: rect.bottom,
	}
}

function useDimensions({
	liveMeasure = true,
}: UseDimensionsArgs = {}): UseDimensionsHook {
	const [dimensions, setDimensions] = useState({})
	const [node, setNode] = useState<HTMLDivElement | null>(null)

	const ref = useCallback((node: HTMLDivElement) => {
		setNode(node)
	}, [])

	useEffect(() => {
		if (node) {
			const measure = () =>
				window.requestAnimationFrame(() =>
					setDimensions(getDimensionObject(node)),
				)
			measure()

			if (liveMeasure) {
				window.addEventListener('resize', measure)
				window.addEventListener('scroll', measure)

				return () => {
					window.removeEventListener('resize', measure)
					window.removeEventListener('scroll', measure)
				}
			}
		}
	}, [node])

	return [ref, dimensions, node]
}

export default useDimensions
