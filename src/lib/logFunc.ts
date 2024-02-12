export function logFunc<P, R, T extends (...args: P[]) => R>(f: T) {
	return (...args: P[]): R => {
		console.debug('logFunc', args)
		return f(...args)
	}
}
