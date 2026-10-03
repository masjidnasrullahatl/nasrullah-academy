// Card processing fee added on top when a parent pays online,
// matching what the Keela forms charged (2.2% + $0.30).
export const CARD_FEE_PERCENT = 0.022;
export const CARD_FEE_FIXED = 0.3;

const round2 = (value: number) => Math.round(value * 100) / 100;

/**
 * Monthly tuition for a number of children. monthlyFees[i] is the total for
 * i + 1 children; beyond the last tier each extra child adds the last step.
 */
export const tuitionForKids = (monthlyFees: number[], kids: number) => {
	if (!monthlyFees.length || kids < 1) return 0;

	if (kids <= monthlyFees.length) return monthlyFees[kids - 1];

	const last = monthlyFees[monthlyFees.length - 1];
	const step =
		monthlyFees.length > 1 ? last - monthlyFees[monthlyFees.length - 2] : last;

	return round2(last + step * (kids - monthlyFees.length));
};

export const withCardFee = (amount: number) =>
	amount > 0 ? round2(amount * (1 + CARD_FEE_PERCENT) + CARD_FEE_FIXED) : 0;

export const getRegistrationQuote = ({
	monthlyFees,
	registrationFee,
	kids,
}: {
	monthlyFees: number[];
	registrationFee: number;
	kids: number;
}) => {
	const monthly = tuitionForKids(monthlyFees, kids);
	const registration = round2(registrationFee * kids);
	const firstPayment = round2(monthly + registration);

	return {
		monthly,
		registration,
		firstPayment,
		card: {
			monthly: withCardFee(monthly),
			firstPayment: withCardFee(firstPayment),
		},
	};
};
