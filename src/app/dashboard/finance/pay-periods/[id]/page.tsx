'use client';

import { useParams } from 'next/navigation';

import { useMemo, useState } from 'react';

import {
	ActionIcon,
	Alert,
	Anchor,
	Badge,
	Button,
	Center,
	Container,
	Divider,
	Group,
	Loader,
	Modal,
	NumberInput,
	Paper,
	Stack,
	Table,
	Text,
	Tooltip,
} from '@mantine/core';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';

import {
	IconAlertCircle,
	IconCashBanknoteMove,
	IconCheck,
	IconEdit,
} from '@tabler/icons-react';
import dayjs from 'dayjs';
import sortBy from 'lodash/sortBy';
import uniqBy from 'lodash/uniqBy';

import PageHeader from '@components/PageHeader';

import {
	PAY_PERIOD_STATUS_COLORS,
	PAY_PERIOD_STATUS_LABELS,
} from '@configs/enums';
import { PATH_DASHBOARD, PATH_FINANCE } from '@configs/routes';

import { useGeneratePay } from '@hooks/react-query/pay-periods/useGeneratePay';
import { useGetPayPeriod } from '@hooks/react-query/pay-periods/useGetPayPeriod';
import { useUpdatePayPeriod } from '@hooks/react-query/pay-periods/useUpdatePayPeriod';
import { useGetPagingPayRecords } from '@hooks/react-query/pay-records/useGetPagingPayRecords';
import { TimesheetRow } from '@hooks/react-query/timesheets/types';
import { useGetPeriodTimesheets } from '@hooks/react-query/timesheets/useGetPeriodTimesheets';
import { useUpdatePeriodTimesheet } from '@hooks/react-query/timesheets/useUpdatePeriodTimesheet';

import { formatMoney } from '@utils/money';

const hoursOf = (row: TimesheetRow | undefined, programId: string) =>
	row?.programs.find((program) => program.id === programId)?.hours || 0;

export default function PayPeriodDetailPage() {
	const params = useParams<{ id: string }>();
	const payPeriodId = params.id;

	const [editing, setEditing] = useState<TimesheetRow | null>(null);
	const [editHours, setEditHours] = useState<Record<string, number | string>>(
		{},
	);
	const [editError, setEditError] = useState('');

	const { data: payPeriod, isLoading: isLoadingPayPeriod } =
		useGetPayPeriod(payPeriodId);
	const { data: timesheets, isLoading: isLoadingTimesheets } =
		useGetPeriodTimesheets(payPeriodId);
	const { data: payRecordsResult, isLoading: isLoadingPayRecords } =
		useGetPagingPayRecords({ page: 1, limit: 500, payPeriodId });

	const { mutateAsync: updateTimesheet, isPending: isSaving } =
		useUpdatePeriodTimesheet();
	const { mutateAsync: generatePay, isPending: isGenerating } =
		useGeneratePay();
	const { mutateAsync: updatePayPeriod, isPending: isUpdatingPayPeriod } =
		useUpdatePayPeriod();

	const rows = useMemo(() => timesheets || [], [timesheets]);

	// One column per program that any teacher teaches or logged hours for
	const programColumns = useMemo(
		() =>
			sortBy(
				uniqBy(
					rows.flatMap((row) => row.programs),
					'id',
				),
				'name',
			),
		[rows],
	);

	const rowByTeacher = useMemo(
		() => new Map(rows.map((row) => [row.teacherId, row])),
		[rows],
	);

	const payRecords = payRecordsResult?.data || [];
	const submittedCount = rows.filter((row) => row.submittedAt).length;
	const canEditPeriod = payPeriod?.status === 'OPEN';
	const canMarkAsPaid = payPeriod?.status === 'LOCKED';

	const breadcrumbItems = [
		{ title: 'Dashboard', href: PATH_DASHBOARD.default },
		{ title: 'Finance', href: PATH_FINANCE.root },
		{ title: 'Pay Periods', href: PATH_FINANCE.payPeriods },
		{
			title: payPeriod?.name || 'Detail',
			href: `${PATH_FINANCE.payPeriods}/${payPeriodId}`,
		},
	].map((item, index) => (
		<Anchor key={index} href={item.href}>
			{item.title}
		</Anchor>
	));

	const openEdit = (row: TimesheetRow) => {
		setEditError('');
		setEditing(row);
		setEditHours(
			Object.fromEntries(row.programs.map((program) => [program.id, program.hours])),
		);
	};

	const handleSaveEdit = async () => {
		if (!editing) return;

		setEditError('');

		try {
			await updateTimesheet({
				payPeriodId,
				teacherId: editing.teacherId,
				hours: editing.programs.map((program) => ({
					programId: program.id,
					hours: Number(editHours[program.id]) || 0,
				})),
			});

			notifications.show({
				title: 'Hours updated',
				message: `${editing.teacherName}'s hours were saved`,
				color: 'green',
			});

			setEditing(null);
		} catch (error) {
			setEditError(error instanceof Error ? error.message : 'Unable to save');
		}
	};

	const handleGeneratePay = () => {
		modals.openConfirmModal({
			title: 'Generate pay?',
			children: (
				<Stack>
					<Text fz="sm">
						{submittedCount} of {rows.length} teachers have submitted. This will
						lock the period and calculate pay for all hours entered. This action
						cannot be undone. Continue?
					</Text>
					<Divider />
				</Stack>
			),
			labels: { confirm: 'Generate', cancel: 'Cancel' },
			onConfirm: async () => {
				try {
					await generatePay({ payPeriodId });
					notifications.show({
						title: 'Generated',
						message: 'Pay has been generated and period is now locked',
						color: 'green',
					});
				} catch (error) {
					notifications.show({
						color: 'red',
						title: 'Generate failed',
						message: error instanceof Error ? error.message : 'Unexpected error',
					});
				}
			},
		});
	};

	const handleMarkAsPaid = () => {
		modals.openConfirmModal({
			title: 'Mark as paid?',
			children: <Text fz="sm">This will mark the pay period as PAID.</Text>,
			labels: { confirm: 'Mark as Paid', cancel: 'Cancel' },
			onConfirm: async () => {
				try {
					await updatePayPeriod({ id: payPeriodId, data: { status: 'PAID' } });
					notifications.show({
						title: 'Updated',
						message: 'Pay period is now marked as paid',
						color: 'green',
					});
				} catch (error) {
					notifications.show({
						title: 'Update failed',
						message: error instanceof Error ? error.message : 'Unexpected error',
						color: 'red',
					});
				}
			},
		});
	};

	if (isLoadingPayPeriod || !payPeriod) {
		return (
			<Container fluid>
				<Center h={260}>
					<Loader />
				</Center>
			</Container>
		);
	}

	const programTotals = programColumns.map((program) => ({
		...program,
		hours: rows.reduce((sum, row) => sum + hoursOf(row, program.id), 0),
		cost: payRecords.reduce(
			(sum, record) =>
				sum + hoursOf(rowByTeacher.get(record.teacherId), program.id) * record.hourlyRate,
			0,
		),
	}));

	return (
		<>
			<title>{payPeriod.name} | Nasrullah Academy</title>
			<Container fluid>
				<Stack>
					<PageHeader title={payPeriod.name} breadcrumbItems={breadcrumbItems} />

					<Group justify="space-between" wrap="wrap">
						<Group gap="sm" wrap="wrap">
							<Badge
								color={PAY_PERIOD_STATUS_COLORS[payPeriod.status]}
								variant="light"
							>
								{PAY_PERIOD_STATUS_LABELS[payPeriod.status]}
							</Badge>
							<Text c="dimmed">
								{dayjs(payPeriod.startDate).format('MM/DD/YYYY')} –{' '}
								{dayjs(payPeriod.endDate).format('MM/DD/YYYY')}
							</Text>
						</Group>

						<Group>
							{canEditPeriod && (
								<Button
									color="orange"
									onClick={handleGeneratePay}
									loading={isGenerating}
									leftSection={<IconCashBanknoteMove />}
								>
									Generate Pay
								</Button>
							)}
							{canMarkAsPaid && (
								<Button
									onClick={handleMarkAsPaid}
									loading={isUpdatingPayPeriod}
									color="teal"
									leftSection={<IconCheck size={16} />}
								>
									Mark as Paid
								</Button>
							)}
						</Group>
					</Group>

					<Paper withBorder p="md">
						<Group justify="space-between" mb="sm">
							<Text fw={700}>Timesheets</Text>
							<Text size="sm" c="dimmed">
								{submittedCount} / {rows.length} submitted
							</Text>
						</Group>

						{isLoadingTimesheets ? (
							<Center h={120}>
								<Loader size="sm" />
							</Center>
						) : rows.length === 0 ? (
							<Text c="dimmed" size="sm">
								No teachers are assigned to a program yet. Assign programs on the
								Teachers page.
							</Text>
						) : (
							<Table.ScrollContainer minWidth={640}>
								<Table withTableBorder withColumnBorders>
									<Table.Thead>
										<Table.Tr>
											<Table.Th ta="center" w={50}>
												#
											</Table.Th>
											<Table.Th>Teacher</Table.Th>
											{programColumns.map((program) => (
												<Table.Th key={program.id} ta="right">
													{program.name}
												</Table.Th>
											))}
											<Table.Th ta="right">Total hours</Table.Th>
											<Table.Th ta="center">Status</Table.Th>
											{canEditPeriod && <Table.Th w={60} />}
										</Table.Tr>
									</Table.Thead>
									<Table.Tbody>
										{rows.map((row, index) => (
											<Table.Tr key={row.teacherId}>
												<Table.Td ta="center">{index + 1}</Table.Td>
												<Table.Td>{row.teacherName}</Table.Td>
												{programColumns.map((program) => {
													const teaches = row.programs.some(
														(item) => item.id === program.id,
													);

													return (
														<Table.Td key={program.id} ta="right">
															{teaches ? (
																hoursOf(row, program.id).toFixed(2)
															) : (
																<Text span c="dimmed">
																	—
																</Text>
															)}
														</Table.Td>
													);
												})}
												<Table.Td ta="right" fw={600}>
													{row.totalHours.toFixed(2)}
												</Table.Td>
												<Table.Td ta="center">
													<Badge
														color={row.submittedAt ? 'green' : 'yellow'}
														variant="light"
													>
														{row.submittedAt ? 'Submitted' : 'Pending'}
													</Badge>
												</Table.Td>
												{canEditPeriod && (
													<Table.Td ta="center">
														<Tooltip label="Edit hours">
															<ActionIcon
																variant="subtle"
																color="yellow"
																onClick={() => openEdit(row)}
															>
																<IconEdit size={16} />
															</ActionIcon>
														</Tooltip>
													</Table.Td>
												)}
											</Table.Tr>
										))}
									</Table.Tbody>
									<Table.Tfoot>
										<Table.Tr>
											<Table.Td colSpan={2} fw={700}>
												Total
											</Table.Td>
											{programTotals.map((program) => (
												<Table.Td key={program.id} ta="right" fw={700}>
													{program.hours.toFixed(2)}
												</Table.Td>
											))}
											<Table.Td ta="right" fw={700}>
												{rows.reduce((sum, row) => sum + row.totalHours, 0).toFixed(2)}
											</Table.Td>
											<Table.Td colSpan={canEditPeriod ? 2 : 1} />
										</Table.Tr>
									</Table.Tfoot>
								</Table>
							</Table.ScrollContainer>
						)}
					</Paper>

					{payPeriod.status !== 'OPEN' && (
						<Paper withBorder p="md">
							<Text fw={700} mb="sm">
								Pay Report
							</Text>

							{isLoadingPayRecords ? (
								<Center h={120}>
									<Loader size="sm" />
								</Center>
							) : (
								<Table.ScrollContainer minWidth={720}>
									<Table withTableBorder withColumnBorders>
										<Table.Thead>
											<Table.Tr>
												<Table.Th ta="center" w={50}>
													#
												</Table.Th>
												<Table.Th>Teacher</Table.Th>
												{programColumns.map((program) => (
													<Table.Th key={program.id} ta="right">
														{program.name}
													</Table.Th>
												))}
												<Table.Th ta="right">Total Hours</Table.Th>
												<Table.Th ta="right">Rate</Table.Th>
												<Table.Th ta="right">Total Pay</Table.Th>
											</Table.Tr>
										</Table.Thead>
										<Table.Tbody>
											{payRecords.map((record, index) => {
												const row = rowByTeacher.get(record.teacherId);

												return (
													<Table.Tr key={record.id}>
														<Table.Td ta="center">{index + 1}</Table.Td>
														<Table.Td>{`${record.teacher.firstName} ${record.teacher.lastName}`}</Table.Td>
														{programColumns.map((program) => {
															const programHours = hoursOf(row, program.id);

															return (
																<Table.Td key={program.id} ta="right">
																	{programHours ? (
																		<>
																			{formatMoney(programHours * record.hourlyRate)}
																			<Text size="xs" c="dimmed">
																				{programHours.toFixed(2)} hrs
																			</Text>
																		</>
																	) : (
																		<Text span c="dimmed">
																			—
																		</Text>
																	)}
																</Table.Td>
															);
														})}
														<Table.Td ta="right">
															{record.totalHours.toFixed(2)}
														</Table.Td>
														<Table.Td ta="right">
															{formatMoney(record.hourlyRate)}
														</Table.Td>
														<Table.Td ta="right">
															{formatMoney(record.totalPay)}
														</Table.Td>
													</Table.Tr>
												);
											})}
										</Table.Tbody>
										<Table.Tfoot>
											<Table.Tr>
												<Table.Td colSpan={2} fw={700}>
													TOTAL
												</Table.Td>
												{programTotals.map((program) => (
													<Table.Td key={program.id} ta="right" fw={700}>
														{formatMoney(program.cost)}
													</Table.Td>
												))}
												<Table.Td ta="right" fw={700}>
													{(payRecordsResult?.summary.totalHours || 0).toFixed(2)}
												</Table.Td>
												<Table.Td ta="right">—</Table.Td>
												<Table.Td ta="right" fw={700}>
													{formatMoney(payRecordsResult?.summary.totalPay || 0)}
												</Table.Td>
											</Table.Tr>
										</Table.Tfoot>
									</Table>
								</Table.ScrollContainer>
							)}
						</Paper>
					)}
				</Stack>
			</Container>

			<Modal
				opened={Boolean(editing)}
				onClose={() => setEditing(null)}
				title={editing ? `Edit hours: ${editing.teacherName}` : ''}
			>
				<Stack>
					{editError && (
						<Alert color="red" icon={<IconAlertCircle size={16} />}>
							{editError}
						</Alert>
					)}

					{editing?.submittedAt && (
						<Text size="sm" c="dimmed">
							Submitted on {dayjs(editing.submittedAt).format('MM/DD/YYYY')}.
							Staff can still correct the hours.
						</Text>
					)}

					{editing?.programs.length === 0 && (
						<Text size="sm">
							This teacher has no programs. Assign programs on the Teachers page
							first.
						</Text>
					)}

					{editing?.programs.map((program) => (
						<NumberInput
							key={program.id}
							label={`${program.name} hours`}
							min={0}
							max={500}
							step={0.25}
							decimalScale={2}
							value={editHours[program.id] ?? ''}
							onChange={(value) =>
								setEditHours((prev) => ({ ...prev, [program.id]: value }))
							}
						/>
					))}

					<Group justify="flex-end">
						<Button variant="default" onClick={() => setEditing(null)}>
							Cancel
						</Button>
						<Button
							loading={isSaving}
							disabled={!editing?.programs.length}
							onClick={handleSaveEdit}
						>
							Save hours
						</Button>
					</Group>
				</Stack>
			</Modal>
		</>
	);
}
