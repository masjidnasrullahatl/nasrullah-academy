const moneyFormatter = new Intl.NumberFormat('en-US', {
	style: 'currency',
	currency: 'USD',
});

export const formatMoney = (value: number): string => moneyFormatter.format(value);
