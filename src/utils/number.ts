const decimalFormatter = new Intl.NumberFormat('en-US', {
	minimumFractionDigits: 2,
	maximumFractionDigits: 2,
});

const percentFormatter = new Intl.NumberFormat('en-US', {
	style: 'percent',
	minimumFractionDigits: 2,
	maximumFractionDigits: 2,
});

export const formatDecimal = (value: number): string => decimalFormatter.format(value);

export const formatPercent = (value: number): string => percentFormatter.format(value);
