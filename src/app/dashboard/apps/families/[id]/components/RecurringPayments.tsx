import { useState } from 'react';

import {
	ActionIcon,
	Alert,
	Anchor,
	Badge,
	Button,
	Collapse,
	CopyButton,
	Grid,
	Group,
	Loader,
	Menu,
	NumberInput,
	Paper,
	Radio,
	Select,
	Stack,
	Table,
	Text,
	TextInput,
	Tooltip,
} from '@mantine/core';
import { MonthPickerInput } from '@mantine/dates';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';

import {
	IconAlertCircle,
	IconCheck,
	IconChevronDown,
	IconCopy,
	IconCreditCard,
	IconDots,
	IconExternalLink,
	IconLink,
} from '@tabler/icons-react';
import dayjs from 'dayjs';

import { FamilySubscriptionView } from '@app/api/subscriptions/types';

import { PAY_METHOD_LABELS } from '@configs/enums';

import {
	useCancelSubscription,
	useChargeCard,
	useCreateCardUpdateLink,
	useGetFamilySubscriptions,
	useLinkSubscription,
	usePayUnpaidInvoice,
	useUnlinkSubscription,
	useUpdateSubscriptionAmount,
} from '@hooks/react-query/subscriptions/useFamilySubscriptions';

import { formatMoney } from '@utils/money';

type ProgramOption = { id: string; name: string };

const formatDate = (unix?: number | null) =>
	unix ? dayjs.unix(unix).format('MMMM D, YYYY') : '-';

const errorMessage = (error: unknown) =>
	error instanceof Error ? error.message : 'Something went wrong';

const statusBadge = (view: FamilySubscriptionView) => {
	const summary = view.summary;

	if (!summary) return <Badge color="gray">Unavailable</Badge>;

	if (summary.cancelAtPeriodEnd) {
		return (
			<Badge color="orange">
				Cancels {dayjs.unix(summary.cancelAt || 0).format('MMM D')}
			</Badge>
		);
	}

	if (summary.status === 'canceled' && summary.canceledAt) {
		return (
			<Badge color="gray">
				Cancelled {dayjs.unix(summary.canceledAt).format('MMM D, YYYY')}
			</Badge>
		);
	}

	const map: Record<string, [string, string]> = {
		active: ['green', 'Active'],
		trialing: ['blue', 'Scheduled'],
		past_due: ['red', 'Past due'],
		unpaid: ['red', 'Unpaid'],
		canceled: ['gray', 'Cancelled'],
		incomplete: ['yellow', 'Incomplete'],
		incomplete_expired: ['gray', 'Expired'],
		paused: ['gray', 'Paused'],
	};
	const [color, label] = map[summary.status] || ['gray', summary.status];

	return <Badge color={color}>{label}</Badge>;
};

/* ----------------------------- modals ----------------------------- */

const CardUpdateModal = ({ subscriptionId }: { subscriptionId: string }) => {
	const { mutateAsync, data, isPending, error } = useCreateCardUpdateLink();

	return (
		<Stack>
			<Text size="sm">
				This opens Stripe&apos;s secure page where a new card can be entered.
				Card numbers never pass through the Academy portal. The new card is
				used from the next monthly payment on.
			</Text>

			{error && (
				<Alert color="red" icon={<IconAlertCircle size={16} />}>
					{errorMessage(error)}
				</Alert>
			)}

			{!data ? (
				<Button
					loading={isPending}
					leftSection={<IconCreditCard size={16} />}
					onClick={() => mutateAsync(subscriptionId)}
				>
					Create secure card link
				</Button>
			) : (
				<Stack gap="xs">
					<TextInput value={data.url} readOnly />
					<Group>
						<CopyButton value={data.url}>
							{({ copied, copy }) => (
								<Button
									variant="light"
									leftSection={
										copied ? <IconCheck size={16} /> : <IconCopy size={16} />
									}
									onClick={copy}
								>
									{copied ? 'Copied' : 'Copy link to send to the parent'}
								</Button>
							)}
						</CopyButton>
						<Button
							component="a"
							href={data.url}
							target="_blank"
							rel="noopener noreferrer"
							leftSection={<IconExternalLink size={16} />}
						>
							Open
						</Button>
					</Group>
					<Text size="xs" c="dimmed">
						The link works until {formatDate(data.expiresAt)} (
						{dayjs.unix(data.expiresAt).format('h:mm A')}).
					</Text>
				</Stack>
			)}
		</Stack>
	);
};

const ChargeCardModal = ({
	subscriptionId,
	familyId,
	amount,
	card,
}: {
	subscriptionId: string;
	familyId: string;
	amount: number;
	card: string;
}) => {
	const [month, setMonth] = useState<Date | null>(
		dayjs().startOf('month').toDate(),
	);
	const [value, setValue] = useState<number | string>(amount);
	const { mutateAsync, isPending, error } = useChargeCard();
	const monthLabel = month ? dayjs(month).format('MMMM YYYY') : '';

	const handleCharge = async () => {
		if (!month || !(Number(value) > 0)) return;

		await mutateAsync({
			subscriptionId,
			familyId,
			year: dayjs(month).year(),
			month: dayjs(month).month() + 1,
			amount: Number(value),
		});
		notifications.show({
			title: 'Payment received',
			message: `${formatMoney(Number(value))} for ${monthLabel} was charged and marked paid.`,
			color: 'green',
		});
		modals.closeAll();
	};

	return (
		<Stack>
			<Text size="sm">
				Charges the {card} once. The month is then marked paid in Monthly
				Payments. A month already marked paid cannot be charged.
			</Text>
			<MonthPickerInput
				label="Month this payment is for"
				valueFormat="MMMM YYYY"
				value={month}
				onChange={(next) => setMonth(next ? dayjs(next).toDate() : null)}
				withAsterisk
			/>
			<NumberInput
				label="Amount"
				prefix="$"
				min={1}
				decimalScale={2}
				fixedDecimalScale
				value={value}
				onChange={setValue}
				withAsterisk
			/>
			{error && (
				<Alert color="red" icon={<IconAlertCircle size={16} />}>
					{errorMessage(error)}
				</Alert>
			)}
			<Group justify="flex-end">
				<Button variant="default" onClick={() => modals.closeAll()}>
					Back
				</Button>
				<Button
					color="red"
					leftSection={<IconCreditCard size={16} />}
					loading={isPending}
					disabled={!month || !(Number(value) > 0)}
					onClick={handleCharge}
				>
					Charge {Number(value) > 0 ? formatMoney(Number(value)) : ''}
				</Button>
			</Group>
		</Stack>
	);
};

const EditAmountModal = ({
	subscriptionId,
	amount,
	otherFamilies,
}: {
	subscriptionId: string;
	amount: number;
	otherFamilies: { name: string }[];
}) => {
	const [value, setValue] = useState<number | string>(amount);
	const { mutateAsync, isPending, error } = useUpdateSubscriptionAmount();

	const handleSave = async () => {
		await mutateAsync({ subscriptionId, amount: Number(value) });

		notifications.show({
			title: 'Amount updated',
			message: `From the next payment on, the card is charged ${formatMoney(Number(value))}.`,
			color: 'green',
		});
		modals.closeAll();
	};

	return (
		<Stack>
			<Text size="sm">
				This is the amount charged to the card each month, card fee included.
				The change applies from the next payment; nothing is charged or
				refunded now.
			</Text>

			{otherFamilies.length > 0 && (
				<Alert color="yellow" icon={<IconAlertCircle size={16} />}>
					This payment also covers{' '}
					{otherFamilies.map((family) => family.name).join(', ')}.
				</Alert>
			)}

			{error && (
				<Alert color="red" icon={<IconAlertCircle size={16} />}>
					{errorMessage(error)}
				</Alert>
			)}

			<NumberInput
				label="Monthly charge"
				prefix="$"
				min={1}
				decimalScale={2}
				fixedDecimalScale
				thousandSeparator=","
				value={value}
				onChange={setValue}
			/>

			<Group justify="flex-end">
				<Button variant="default" onClick={() => modals.closeAll()}>
					Cancel
				</Button>
				<Button
					loading={isPending}
					disabled={!(Number(value) > 0) || Number(value) === amount}
					onClick={handleSave}
				>
					Save amount
				</Button>
			</Group>
		</Stack>
	);
};

const CancelModal = ({
	subscriptionId,
	nextPaymentAt,
	otherFamilies,
}: {
	subscriptionId: string;
	nextPaymentAt: number | null;
	otherFamilies: { name: string }[];
}) => {
	const [when, setWhen] = useState<'period_end' | 'now'>('period_end');
	const { mutateAsync, isPending, error } = useCancelSubscription();

	const handleCancel = async () => {
		await mutateAsync({ subscriptionId, when });

		notifications.show({
			title: 'Recurring payment cancelled',
			message:
				when === 'now'
					? 'No further payments will be charged.'
					: 'It stops after the current month.',
			color: 'green',
		});
		modals.closeAll();
	};

	return (
		<Stack>
			{otherFamilies.length > 0 && (
				<Alert color="yellow" icon={<IconAlertCircle size={16} />}>
					This payment also covers{' '}
					{otherFamilies.map((family) => family.name).join(', ')}. Cancelling
					stops it for them too.
				</Alert>
			)}

			{error && (
				<Alert color="red" icon={<IconAlertCircle size={16} />}>
					{errorMessage(error)}
				</Alert>
			)}

			<Radio.Group
				value={when}
				onChange={(value) => setWhen(value as 'period_end' | 'now')}
			>
				<Stack gap="sm">
					<Radio
						value="period_end"
						label="After the current month"
						description={
							nextPaymentAt
								? `No payment on ${formatDate(nextPaymentAt)} or after.`
								: 'Stops at the end of the current period.'
						}
					/>
					<Radio
						value="now"
						label="Immediately"
						description="Stops right away. This cannot be undone."
					/>
				</Stack>
			</Radio.Group>

			<Group justify="flex-end">
				<Button variant="default" onClick={() => modals.closeAll()}>
					Keep it
				</Button>
				<Button color="red" loading={isPending} onClick={handleCancel}>
					Cancel recurring payment
				</Button>
			</Group>
		</Stack>
	);
};

const LinkModal = ({
	familyId,
	programs,
}: {
	familyId: string;
	programs: ProgramOption[];
}) => {
	const [subscriptionId, setSubscriptionId] = useState('');
	const [programId, setProgramId] = useState<string | null>(
		programs.length === 1 ? programs[0].id : null,
	);
	const { mutateAsync, isPending, error } = useLinkSubscription();

	const handleLink = async () => {
		await mutateAsync({
			familyId,
			stripeSubscriptionId: subscriptionId.trim(),
			programId,
		});

		notifications.show({
			title: 'Linked',
			message: 'The recurring payment now shows on this family.',
			color: 'green',
		});
		modals.closeAll();
	};

	return (
		<Stack>
			<Text size="sm">
				Links an existing Stripe subscription to this family. Nothing changes
				in Stripe.
			</Text>

			{error && (
				<Alert color="red" icon={<IconAlertCircle size={16} />}>
					{errorMessage(error)}
				</Alert>
			)}

			<TextInput
				label="Stripe subscription ID"
				placeholder="sub_..."
				value={subscriptionId}
				onChange={(event) => setSubscriptionId(event.currentTarget.value)}
			/>
			<Select
				label="Program it pays for"
				data={programs.map((program) => ({
					value: program.id,
					label: program.name,
				}))}
				value={programId}
				onChange={setProgramId}
				clearable
			/>

			<Group justify="flex-end">
				<Button variant="default" onClick={() => modals.closeAll()}>
					Cancel
				</Button>
				<Button
					loading={isPending}
					disabled={!/^sub_\w+$/.test(subscriptionId.trim())}
					onClick={handleLink}
				>
					Link
				</Button>
			</Group>
		</Stack>
	);
};

/* --------------------------- subscription --------------------------- */

const SubscriptionCard = ({
	view,
	familyId,
}: {
	view: FamilySubscriptionView;
	familyId: string;
}) => {
	const { mutateAsync: resume } = useCancelSubscription();
	const { mutateAsync: unlink } = useUnlinkSubscription();
	const { mutateAsync: payInvoice, isPending: isCharging } =
		usePayUnpaidInvoice();
	const [chargingId, setChargingId] = useState<string | null>(null);
	const summary = view.summary;
	const isCancelled = summary?.status === 'canceled';
	// Another family pays this one for them: changes are made from the payer
	const isPayer = view.links.some((link) => link.isPayer);
	const payers = view.otherFamilies.filter((family) => family.isPayer);
	const covered = view.otherFamilies.filter((family) => !family.isPayer);
	const canManage = Boolean(summary) && !isCancelled && isPayer;

	const openCardUpdate = () =>
		modals.open({
			title: 'Update credit card',
			children: <CardUpdateModal subscriptionId={view.stripeSubscriptionId} />,
		});

	const openChargeCard = () =>
		summary?.card &&
		modals.open({
			title: 'Charge card',
			children: (
				<ChargeCardModal
					subscriptionId={view.stripeSubscriptionId}
					familyId={familyId}
					amount={summary.amount}
					card={`${summary.card.brand} card ending ${summary.card.last4}`}
				/>
			),
		});

	const openEditAmount = () =>
		summary &&
		modals.open({
			title: 'Edit recurring amount',
			children: (
				<EditAmountModal
					subscriptionId={view.stripeSubscriptionId}
					amount={summary.amount}
					otherFamilies={covered}
				/>
			),
		});

	const openCancel = () =>
		modals.open({
			title: 'Cancel recurring payment',
			children: (
				<CancelModal
					subscriptionId={view.stripeSubscriptionId}
					nextPaymentAt={summary?.nextPaymentAt || null}
					otherFamilies={covered}
				/>
			),
		});

	const handleResume = () =>
		modals.openConfirmModal({
			title: 'Keep the recurring payment?',
			children: (
				<Text size="sm">The scheduled cancellation is removed.</Text>
			),
			labels: { confirm: 'Keep it going', cancel: 'Back' },
			onConfirm: async () => {
				try {
					await resume({
						subscriptionId: view.stripeSubscriptionId,
						when: 'resume',
					});
				} catch (error) {
					notifications.show({
						title: 'Not changed',
						message: errorMessage(error),
						color: 'red',
					});
				}
			},
		});

	const handleCharge = (invoice: FamilySubscriptionView['unpaid'][number]) =>
		modals.openConfirmModal({
			title: 'Charge the card now?',
			children: (
				<Text size="sm">
					{formatMoney(invoice.amount)} for{' '}
					{dayjs.unix(invoice.periodStart).format('MMMM YYYY')} will be charged
					to{' '}
					{summary?.card
						? `the ${summary.card.brand} card ending ${summary.card.last4}`
						: 'the card on file'}
					. This pays the missed charge itself, so it cannot be charged twice.
				</Text>
			),
			labels: { confirm: 'Charge card', cancel: 'Back' },
			onConfirm: async () => {
				setChargingId(invoice.id);

				try {
					await payInvoice({
						subscriptionId: view.stripeSubscriptionId,
						invoiceId: invoice.id,
					});
					notifications.show({
						title: 'Payment received',
						message: `${formatMoney(invoice.amount)} for ${dayjs.unix(invoice.periodStart).format('MMMM YYYY')} was charged.`,
						color: 'green',
					});
				} catch (error) {
					notifications.show({
						title: 'The card was not charged',
						message: errorMessage(error),
						color: 'red',
						autoClose: false,
					});
				} finally {
					setChargingId(null);
				}
			},
		});

	const handleUnlink = () =>
		modals.openConfirmModal({
			title: 'Remove from this family?',
			children: (
				<Text size="sm">
					The payment stops showing on this family. It keeps running in
					Stripe.
				</Text>
			),
			labels: { confirm: 'Remove', cancel: 'Back' },
			confirmProps: { color: 'red' },
			onConfirm: async () => {
				for (const link of view.links) {
					await unlink({ familyId, linkId: link.id });
				}
			},
		});

	return (
		<Paper withBorder p="md">
			<Stack>
				<Group justify="space-between" align="flex-start">
					<Group gap="sm">
						<Text fw={700} size="xl">
							{summary ? formatMoney(summary.amount) : '-'}
						</Text>
						{statusBadge(view)}
						{view.links.map((link) =>
							link.programName ? (
								<Badge key={link.id} variant="light">
									{link.programName}
								</Badge>
							) : null,
						)}
					</Group>

					<Menu position="bottom-end" withinPortal>
						<Menu.Target>
							<ActionIcon variant="default" aria-label="Actions">
								<IconDots size={16} />
							</ActionIcon>
						</Menu.Target>
						<Menu.Dropdown>
							<Menu.Item
								disabled={!isPayer || !summary?.card}
								onClick={openChargeCard}
							>
								Charge card
							</Menu.Item>
							<Menu.Item disabled={!canManage} onClick={openEditAmount}>
								Edit amount
							</Menu.Item>
							<Menu.Item disabled={!canManage} onClick={openCardUpdate}>
								Update credit card
							</Menu.Item>
							{summary?.cancelAtPeriodEnd ? (
								<Menu.Item disabled={!isPayer} onClick={handleResume}>
									Undo cancellation
								</Menu.Item>
							) : (
								<Menu.Item color="red" disabled={!canManage} onClick={openCancel}>
									Cancel recurring
								</Menu.Item>
							)}
							<Menu.Divider />
							<Menu.Item onClick={handleUnlink}>
								Remove from this family
							</Menu.Item>
						</Menu.Dropdown>
					</Menu>
				</Group>

				{view.error && (
					<Alert color="red" icon={<IconAlertCircle size={16} />}>
						{view.error}
					</Alert>
				)}

				{!isPayer && payers.length > 0 && (
					<Text size="sm" c="dimmed">
						Paid by {payers.map((family) => family.name).join(', ')}. Changes
						are made from their page.
					</Text>
				)}

				{isPayer && covered.length > 0 && (
					<Text size="sm" c="dimmed">
						Also pays for: {covered.map((family) => family.name).join(', ')}
					</Text>
				)}

				{summary && (
					<Grid>
						<Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
							<Text size="xs" c="dimmed" tt="uppercase">
								Contact
							</Text>
							<Text>{summary.customer.name || '-'}</Text>
							<Text size="sm" c="dimmed">
								{summary.customer.email || ''}
							</Text>
						</Grid.Col>
						<Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
							<Text size="xs" c="dimmed" tt="uppercase">
								Next payment scheduled
							</Text>
							<Text>
								{summary.nextPaymentAt
									? formatDate(summary.nextPaymentAt)
									: 'None'}
							</Text>
						</Grid.Col>
						<Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
							<Text size="xs" c="dimmed" tt="uppercase">
								Card
							</Text>
							<Text tt="capitalize">
								{summary.card
									? `${summary.card.brand} •••• ${summary.card.last4}`
									: '-'}
							</Text>
							{summary.card && (
								<Text size="sm" c="dimmed">
									Expires {String(summary.card.expMonth).padStart(2, '0')}/
									{summary.card.expYear}
								</Text>
							)}
						</Grid.Col>
						<Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
							<Text size="xs" c="dimmed" tt="uppercase">
								Billing cycle
							</Text>
							<Text>
								{summary.intervalCount > 1
									? `Every ${summary.intervalCount} ${summary.interval}s`
									: summary.interval === 'month'
										? 'Monthly'
										: summary.interval}
							</Text>
						</Grid.Col>
						<Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
							<Text size="xs" c="dimmed" tt="uppercase">
								Started
							</Text>
							<Text>{formatDate(summary.startedAt)}</Text>
						</Grid.Col>
						<Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
							<Text size="xs" c="dimmed" tt="uppercase">
								Stripe ID
							</Text>
							<Anchor
								href={`https://dashboard.stripe.com/subscriptions/${view.stripeSubscriptionId}`}
								target="_blank"
								rel="noopener noreferrer"
								size="sm"
							>
								{view.stripeSubscriptionId}
							</Anchor>
						</Grid.Col>
					</Grid>
				)}

				{view.unpaid.length > 0 && (
					<Alert
						color="red"
						icon={<IconAlertCircle size={16} />}
						title="Missed payments"
					>
						<Stack gap="sm">
							{view.unpaid.map((invoice) => (
								<Group
									key={invoice.id}
									justify="space-between"
									align="flex-start"
									wrap="nowrap"
								>
									<div>
										<Text size="sm" fw={600}>
											{dayjs.unix(invoice.periodStart).format('MMMM YYYY')}:{' '}
											{formatMoney(invoice.amount)} not collected
										</Text>
										{invoice.failureMessage && (
											<Text size="sm">{invoice.failureMessage}</Text>
										)}
										{invoice.paidInPortal && (
											<Text size="sm" fw={600} c="green">
												Already marked paid in Monthly Payments (
												{PAY_METHOD_LABELS[invoice.paidInPortal]}), so it
												cannot be charged here.
											</Text>
										)}
										<Text size="xs" c="dimmed">
											{invoice.nextAttemptAt
												? `Stripe will try again on ${formatDate(invoice.nextAttemptAt)}.`
												: 'Stripe will not try again automatically.'}
										</Text>
									</div>
									<Button
										size="xs"
										color="red"
										leftSection={<IconCreditCard size={14} />}
										disabled={
											!isPayer ||
											Boolean(invoice.paidInPortal) ||
											(isCharging && chargingId !== invoice.id)
										}
										loading={chargingId === invoice.id}
										onClick={() => handleCharge(invoice)}
									>
										Charge card now
									</Button>
								</Group>
							))}
							{isPayer && (
								<Text size="xs">
									If the card keeps failing, use Update credit card first.
								</Text>
							)}
						</Stack>
					</Alert>
				)}

				<Stack gap={4}>
					<Text fw={600}>Paid transactions</Text>
					{view.payments.length ? (
						<Table.ScrollContainer minWidth={560}>
							<Table striped>
								<Table.Thead>
									<Table.Tr>
										<Table.Th>Received</Table.Th>
										<Table.Th>Amount</Table.Th>
										<Table.Th>Invoice</Table.Th>
										<Table.Th>Receipt</Table.Th>
									</Table.Tr>
								</Table.Thead>
								<Table.Tbody>
									{view.payments.map((payment) => (
										<Table.Tr key={payment.id}>
											<Table.Td>
												{dayjs.unix(payment.paidAt).format('MMMM D, YYYY - h:mm A')}
											</Table.Td>
											<Table.Td>{formatMoney(payment.amount)}</Table.Td>
											<Table.Td>{payment.number || '-'}</Table.Td>
											<Table.Td>
												<Group gap="xs">
													{payment.receiptUrl && (
														<Anchor
															href={payment.receiptUrl}
															target="_blank"
															rel="noopener noreferrer"
															size="sm"
														>
															View
														</Anchor>
													)}
													{payment.pdfUrl && (
														<Anchor
															href={payment.pdfUrl}
															target="_blank"
															rel="noopener noreferrer"
															size="sm"
														>
															PDF
														</Anchor>
													)}
												</Group>
											</Table.Td>
										</Table.Tr>
									))}
								</Table.Tbody>
							</Table>
						</Table.ScrollContainer>
					) : (
						<Text size="sm" c="dimmed">
							No paid transactions yet.
						</Text>
					)}
				</Stack>
			</Stack>
		</Paper>
	);
};

/* ----------------------------- section ----------------------------- */

export const RecurringPayments = ({
	familyId,
	programs,
}: {
	familyId: string;
	programs: ProgramOption[];
}) => {
	const { data, isLoading, error } = useGetFamilySubscriptions(familyId);
	const [showPast, setShowPast] = useState(false);

	const isPast = (view: FamilySubscriptionView) =>
		['canceled', 'incomplete_expired'].includes(view.summary?.status || '');
	const current = data?.subscriptions.filter((view) => !isPast(view)) || [];
	const past = data?.subscriptions.filter(isPast) || [];

	const openLink = () =>
		modals.open({
			title: 'Link a recurring payment',
			children: <LinkModal familyId={familyId} programs={programs} />,
		});

	return (
		<Paper p="md">
			<Stack>
				<Group justify="space-between">
					<Text fw={700} size="lg">
						Recurring payments
					</Text>
					<Tooltip label="Link an existing Stripe subscription">
						<Button
							variant="light"
							size="xs"
							leftSection={<IconLink size={14} />}
							onClick={openLink}
							disabled={data ? !data.stripeEnabled : true}
						>
							Link payment
						</Button>
					</Tooltip>
				</Group>

				{isLoading && <Loader size="sm" />}

				{error && (
					<Alert color="red" icon={<IconAlertCircle size={16} />}>
						{errorMessage(error)}
					</Alert>
				)}

				{data && !data.stripeEnabled && (
					<Text size="sm" c="dimmed">
						Stripe is not connected yet.
					</Text>
				)}

				{data?.stripeEnabled && !current.length && (
					<Text size="sm" c="dimmed">
						No active recurring card payment for this family.
					</Text>
				)}

				{current.map((view) => (
					<SubscriptionCard
						key={view.stripeSubscriptionId}
						view={view}
						familyId={familyId}
					/>
				))}

				{past.length > 0 && (
					<Stack gap="sm">
						<Button
							variant="subtle"
							color="gray"
							size="xs"
							w="fit-content"
							rightSection={
								<IconChevronDown
									size={14}
									style={{
										transform: showPast ? 'rotate(180deg)' : undefined,
									}}
								/>
							}
							onClick={() => setShowPast((value) => !value)}
						>
							Previous recurring payments ({past.length})
						</Button>
						<Collapse in={showPast}>
							<Stack>
								{past.map((view) => (
									<SubscriptionCard
										key={view.stripeSubscriptionId}
										view={view}
										familyId={familyId}
									/>
								))}
							</Stack>
						</Collapse>
					</Stack>
				)}
			</Stack>
		</Paper>
	);
};
