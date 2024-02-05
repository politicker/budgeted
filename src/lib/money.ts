export function formatMoney(money: number) {
	return `$${money.toLocaleString()}`
}

export function parseMoney(money: string) {
	return parseInt(money.replace(/\D/g, ''))
}

export function formatMoneyK(amount: unknown) {
	if (typeof amount !== 'number') return 'N/A'
	return `$${
		amount > 1000 ? `${Math.round(amount / 100) / 10}k` : Math.round(amount)
	}`
}
