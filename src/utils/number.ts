const decimalFormatter = new Intl.NumberFormat('en-US', {
	minimumFractionDigits: 2,
	maximumFractionDigits: 2,
});

export const formatDecimal = (value: number): string => decimalFormatter.format(value);
