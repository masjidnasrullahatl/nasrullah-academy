import { PaymentStatus, RegistrationStatus } from '@prisma/client';

export const STATUS_COLORS: Record<RegistrationStatus, string> = {
	PENDING: 'yellow',
	APPROVED: 'green',
	REJECTED: 'gray',
};

export const STATUS_LABELS: Record<RegistrationStatus, string> = {
	PENDING: 'Pending',
	APPROVED: 'Approved',
	REJECTED: 'Rejected',
};

export const paymentLabel = (registration: {
	payByCard: boolean;
	paymentStatus: PaymentStatus;
}) => {
	if (registration.paymentStatus === 'PAID') return 'Paid by card';

	return registration.payByCard ? 'Card not completed' : 'Pay later';
};
