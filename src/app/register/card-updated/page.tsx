import { Alert, Stack, Text, Title } from '@mantine/core';

import { applyCardUpdate, isStripeEnabled } from '@helpers/stripe';

export const dynamic = 'force-dynamic';

type PageProps = {
	searchParams: Promise<{ session_id?: string; cancelled?: string }>;
};

// Where Stripe sends the parent after the secure "update your card" page
export default async function CardUpdatedPage({ searchParams }: PageProps) {
	const { session_id: sessionId, cancelled } = await searchParams;

	let status: 'updated' | 'cancelled' | 'failed' = 'failed';

	if (cancelled) {
		status = 'cancelled';
	} else if (sessionId && isStripeEnabled()) {
		try {
			status = (await applyCardUpdate(sessionId)) ? 'updated' : 'failed';
		} catch (error) {
			console.log('Apply card update error', error);
		}
	}

	return (
		<Stack maw={560} mx="auto" mt="xl">
			<title>Card update | Nasrullah Academy</title>
			<Title order={2}>Nasrullah Academy</Title>

			{status === 'updated' && (
				<Alert color="green" title="Your card has been updated">
					Thank you. Your monthly tuition will be charged to the new card from
					the next payment on.
				</Alert>
			)}

			{status === 'cancelled' && (
				<Alert color="gray" title="No changes made">
					Your card was not changed. You can use the link again if you need to
					update it.
				</Alert>
			)}

			{status === 'failed' && (
				<Alert color="red" title="We couldn't confirm the card update">
					Please contact the Academy office so we can help.
				</Alert>
			)}

			<Text size="sm" c="dimmed">
				Masjid Nasrullah · Nasrullah Academy
			</Text>
		</Stack>
	);
}
