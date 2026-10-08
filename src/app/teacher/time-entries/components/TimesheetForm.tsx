import { useEffect, useMemo, useState } from 'react';

import {
	Alert,
	Badge,
	Button,
	Center,
	Group,
	Loader,
	NumberInput,
	Paper,
	Select,
	Stack,
	Table,
	Text,
} from '@mantine/core';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';

import { IconAlertCircle, IconDeviceFloppy, IconSend } from '@tabler/icons-react';
import dayjs from 'dayjs';

import { useGetMyTimesheet } from '@hooks/react-query/teacher/useGetMyTimesheet';
import {
	TeacherPayPeriod,
	useGetTeacherPayPeriods,
} from '@hooks/react-query/teacher/useGetTeacherPayPeriods';
import { useSaveMyTimesheet } from '@hooks/react-query/teacher/useSaveMyTimesheet';

const statusBadge = (
	period: TeacherPayPeriod | undefined,
	submittedAt: string | null | undefined,
) => {
	if (!period) return null;

	if (period.status === 'PAID') return <Badge color="teal">Paid</Badge>;

	if (period.status === 'LOCKED') {
		return <Badge color="orange">Locked — pay generated</Badge>;
	}

	if (submittedAt) {
		return (
			<Badge color="green">
				Submitted on {dayjs(submittedAt).format('MM/DD/YYYY')}
			</Badge>
		);
	}

	return <Badge color="blue">Open</Badge>;
};

// The open period that covers today, otherwise the most recent one
const pickDefaultPeriod = (periods: TeacherPayPeriod[]) => {
	const today = dayjs();

	return (
		periods.find(
			(period) =>
				period.status === 'OPEN' &&
				!today.isBefore(dayjs(period.startDate), 'day') &&
				!today.isAfter(dayjs(period.endDate), 'day'),
		) ||
		periods.find((period) => period.status === 'OPEN') ||
		periods[0]
	);
};

export const TimesheetForm = () => {
	const { data: periods, isLoading: isLoadingPeriods } =
		useGetTeacherPayPeriods();

	const [periodId, setPeriodId] = useState<string | null>(null);
	const [hours, setHours] = useState<Record<string, number | string>>({});
	const [error, setError] = useState('');

	useEffect(() => {
		if (!periodId && periods?.length) {
			setPeriodId(pickDefaultPeriod(periods)?.id || null);
		}
	}, [periodId, periods]);

	const { data: timesheet, isLoading: isLoadingTimesheet } = useGetMyTimesheet(
		periodId || undefined,
	);
	const { mutateAsync: saveTimesheet, isPending } = useSaveMyTimesheet();

	useEffect(() => {
		setError('');
		setHours(
			Object.fromEntries(
				timesheet?.programs.map((program) => [program.id, program.hours]) ||
					[],
			),
		);
	}, [timesheet]);

	const period = periods?.find((item) => item.id === periodId);
	const canEdit = period?.status === 'OPEN' && !timesheet?.submittedAt;

	const total = useMemo(
		() =>
			Object.values(hours).reduce<number>(
				(sum, value) => sum + (Number(value) || 0),
				0,
			),
		[hours],
	);

	const save = async (submit: boolean) => {
		if (!periodId || !timesheet) return;

		setError('');

		try {
			await saveTimesheet({
				payPeriodId: periodId,
				submit,
				hours: timesheet.programs.map((program) => ({
					programId: program.id,
					hours: Number(hours[program.id]) || 0,
				})),
			});

			notifications.show({
				title: submit ? 'Hours submitted' : 'Saved',
				message: submit
					? 'Your hours were sent to the office'
					: 'You can come back and change them until you submit',
				color: 'green',
			});
		} catch (saveError) {
			setError(
				saveError instanceof Error ? saveError.message : 'Unable to save',
			);
		}
	};

	const handleSubmit = () => {
		modals.openConfirmModal({
			title: 'Submit your hours?',
			children: (
				<Text size="sm">
					You are submitting <b>{total.toFixed(2)} hours</b> for{' '}
					<b>{period?.name}</b>. Once submitted you can&apos;t change them; the
					office can still make corrections.
				</Text>
			),
			labels: { confirm: 'Submit hours', cancel: 'Cancel' },
			confirmProps: { color: 'green' },
			onConfirm: () => save(true),
		});
	};

	if (isLoadingPeriods) {
		return (
			<Center h={200}>
				<Loader />
			</Center>
		);
	}

	if (!periods?.length) {
		return (
			<Alert color="blue" icon={<IconAlertCircle size={16} />}>
				There is no pay period yet. The office will open one.
			</Alert>
		);
	}

	return (
		<Paper withBorder p="lg" maw={640}>
			<Stack>
				<Group align="end">
					<Select
						label="Pay period"
						data={periods.map((item) => ({ value: item.id, label: item.name }))}
						value={periodId}
						onChange={setPeriodId}
						allowDeselect={false}
						w={260}
					/>
					{statusBadge(period, timesheet?.submittedAt)}
				</Group>

				{period && (
					<Text size="sm" c="dimmed">
						{dayjs(period.startDate).format('MM/DD/YYYY')} –{' '}
						{dayjs(period.endDate).format('MM/DD/YYYY')}. Enter your total
						hours for the whole period in each program.
					</Text>
				)}

				{error && (
					<Alert color="red" icon={<IconAlertCircle size={16} />}>
						{error}
					</Alert>
				)}

				{isLoadingTimesheet || !timesheet ? (
					<Center h={120}>
						<Loader size="sm" />
					</Center>
				) : timesheet.programs.length === 0 ? (
					<Alert color="yellow" icon={<IconAlertCircle size={16} />}>
						You are not assigned to a program yet. Please ask the Academy
						office to add your programs.
					</Alert>
				) : (
					<>
						<Table withTableBorder withColumnBorders verticalSpacing="sm">
							<Table.Thead>
								<Table.Tr>
									<Table.Th>Program</Table.Th>
									<Table.Th w={180} ta="right">
										Total hours
									</Table.Th>
								</Table.Tr>
							</Table.Thead>
							<Table.Tbody>
								{timesheet.programs.map((program) => (
									<Table.Tr key={program.id}>
										<Table.Td fw={500}>{program.name}</Table.Td>
										<Table.Td ta="right">
											{canEdit ? (
												<NumberInput
													min={0}
													max={500}
													step={0.25}
													decimalScale={2}
													placeholder="0"
													value={hours[program.id] ?? ''}
													onChange={(value) =>
														setHours((prev) => ({
															...prev,
															[program.id]: value,
														}))
													}
													aria-label={`${program.name} hours`}
												/>
											) : (
												(Number(hours[program.id]) || 0).toFixed(2)
											)}
										</Table.Td>
									</Table.Tr>
								))}
							</Table.Tbody>
							<Table.Tfoot>
								<Table.Tr>
									<Table.Td fw={700}>Total</Table.Td>
									<Table.Td ta="right" fw={700}>
										{total.toFixed(2)}
									</Table.Td>
								</Table.Tr>
							</Table.Tfoot>
						</Table>

						{canEdit && (
							<Group justify="flex-end">
								<Button
									variant="default"
									leftSection={<IconDeviceFloppy size={16} />}
									loading={isPending}
									onClick={() => save(false)}
								>
									Save
								</Button>
								<Button
									color="green"
									leftSection={<IconSend size={16} />}
									disabled={total <= 0}
									loading={isPending}
									onClick={handleSubmit}
								>
									Submit hours
								</Button>
							</Group>
						)}
					</>
				)}
			</Stack>
		</Paper>
	);
};
