// Card processing fee added on top when a parent pays online,
// matching what the Keela forms charged (2.2% + $0.30).
export const CARD_FEE_PERCENT = 0.022;
export const CARD_FEE_FIXED = 0.3;

const round2 = (value: number) => Math.round(value * 100) / 100;

/** Today's date at the school (Atlanta), whatever the server's time zone. */
export const schoolToday = (date = new Date()) => {
	const parts = new Intl.DateTimeFormat('en-US', {
		timeZone: 'America/New_York',
		year: 'numeric',
		month: 'numeric',
		day: 'numeric',
	}).formatToParts(date);

	const value = (type: string) =>
		Number(parts.find((part) => part.type === type)?.value);

	return { year: value('year'), month: value('month'), day: value('day') };
};

// Registering up to this day pays the full month; after it, only the days left
export const FULL_MONTH_LAST_DAY = 15;

/**
 * Tuition for the month a family registers in. Registering on the 1st to
 * the 15th pays the full month; from the 16th, only the days from the
 * registration day to the month's end, out of the days in the month.
 */
export const getFirstMonth = (monthly: number, today = schoolToday()) => {
	const daysInMonth = new Date(today.year, today.month, 0).getDate();
	const isProrated = today.day > FULL_MONTH_LAST_DAY;
	const days = isProrated ? daysInMonth - today.day + 1 : daysInMonth;

	return {
		...today,
		isProrated,
		days,
		daysInMonth,
		amount: round2((monthly * days) / daysInMonth),
	};
};

/** 1st of the month after the registration month, when full tuition starts (unix seconds). */
export const getNextFirstOfMonth = (today = schoolToday()) =>
	// 10:00 UTC is early morning in Atlanta
	Date.UTC(today.year, today.month, 1, 10) / 1000;

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
	customMonthly,
	today,
}: {
	monthlyFees: number[];
	registrationFee: number;
	kids: number;
	// amount the parent agreed with the office, instead of the standard price
	customMonthly?: number | null;
	today?: ReturnType<typeof schoolToday>;
}) => {
	const standardMonthly = tuitionForKids(monthlyFees, kids);
	const monthly = customMonthly ? round2(customMonthly) : standardMonthly;
	const registration = round2(registrationFee * kids);
	const firstMonth = getFirstMonth(monthly, today);
	// Due at registration: the registration fee and the rest of this month
	const firstPayment = round2(firstMonth.amount + registration);

	return {
		monthly,
		standardMonthly,
		isCustom: Boolean(customMonthly) && monthly !== standardMonthly,
		registration,
		firstMonth,
		firstPayment,
		card: {
			monthly: withCardFee(monthly),
			firstPayment: withCardFee(firstPayment),
		},
	};
};
