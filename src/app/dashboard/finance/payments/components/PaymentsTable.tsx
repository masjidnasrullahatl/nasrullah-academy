import { useState } from 'react';

import {
	ActionIcon,
	Alert,
	Badge,
	Button,
	Center,
	Grid,
	Group,
	Pagination,
	Paper,
	Select,
	SimpleGrid,
	Skeleton,
	Stack,
	Table,
	Text,
	TextInput,
	Tooltip,
} from '@mantine/core';
import { useDebouncedCallback } from '@mantine/hooks';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';

import {
	IconAlertCircle,
	IconCheck,
	IconEdit,
	IconEye,
	IconMoodEmpty,
	IconPlus,
	IconSearch,
	IconTrash,
} from '@tabler/icons-react';
import dayjs from 'dayjs';

import {
	MONTH_OPTIONS,
	PAY_METHOD_LABELS,
	PAY_METHOD_OPTIONS,
	PAYMENT_STATUS_COLORS,
	PAYMENT_STATUS_LABELS,
	PAYMENT_STATUS_OPTIONS,
} from '@configs/enums';

import { useGetPagingFamilies } from '@hooks/react-query/families/useGetPagingFamilies';
import { useDeleteInvoice } from '@hooks/react-query/invoices/useDeleteInvoice';
import {
	InvoiceRow,
	useGetPagingInvoices,
} from '@hooks/react-query/invoices/useGetPagingInvoices';
import { useUpdateInvoice } from '@hooks/react-query/invoices/useUpdateInvoice';
import { useGetPagingPrograms } from '@hooks/react-query/programs/useGetPagingPrograms';

import { formatMoney } from '@utils/money';

import { GenerateMonthButton } from './GenerateMonthButton';
import { PaymentDetailModal } from './PaymentDetailModal';
import { PaymentFormModal } from './PaymentFormModal';

const PAGE_SIZE = 20;

export const PaymentsTable = () => {
	const currentDate = new Date();
	const [page, setPage] = useState(1);
	const [filter, setFilter] = useState<{
		year: number;
		month: number;
		programId?: string;
		paymentStatus?: string;
		payMethod?: string;
		familyId?: string;
		keyword?: string;
	}>({
		year: currentDate.getFullYear(),
		month: currentDate.getMonth() + 1,
	});

	const { data: programs } = useGetPagingPrograms({ page: 1, limit: 100 });
	const { data: families } = useGetPagingFamilies({ page: 1, limit: 500 });
	const {
		data: invoices,
		isLoading,
		isError,
		error,
	} = useGetPagingInvoices({
		page,
		limit: PAGE_SIZE,
		year: filter.year,
		month: filter.month,
		programId: filter.programId,
		paymentStatus: filter.paymentStatus as InvoiceRow['paymentStatus'],
		payMethod: filter.payMethod as InvoiceRow['payMethod'],
		familyId: filter.familyId,
		keyword: filter.keyword,
	});

	const { mutateAsync: deleteInvoice, isPending: isDeleting } = useDeleteInvoice();
	const { mutateAsync: updateInvoice, isPending: isUpdating } = useUpdateInvoice();

	const selectedProgram = programs?.data.find((program) => program.id === filter.programId);

	const handleChangeFilter = (key: keyof typeof filter, value?: string | number) => {
		setFilter((prev) => ({ ...prev, [key]: value }));
		setPage(1);
	};

	const debounceChangeKeyword = useDebouncedCallback((value: string) => {
		handleChangeFilter('keyword', value || undefined);
	}, 500);

	const handleCreate = () => {
		modals.open({
			title: 'Create Monthly Payment',
			size: 'xl',
			children: (
				<PaymentFormModal
					defaultYear={filter.year}
					defaultMonth={filter.month}
					defaultProgramId={filter.programId}
				/>
			),
		});
	};

	const handleEdit = (invoice: InvoiceRow) => {
		modals.open({
			title: 'Edit Monthly Payment',
			size: 'xl',
			children: <PaymentFormModal invoice={invoice} />,
		});
	};

	const openDetail = (invoice: InvoiceRow) => {
		const monthLabel = MONTH_OPTIONS.find((item) => Number(item.value) === invoice.month)?.label;
		modals.open({
			title: `${invoice.family.name} — ${monthLabel || invoice.month} ${invoice.year}`,
			size: 'lg',
			children: <PaymentDetailModal invoice={invoice} />,
		});
	};

	const handleDelete = (invoice: InvoiceRow) => {
		modals.openConfirmModal({
			title: `Delete payment for ${invoice.family.name}?`,
			children: `This deletes the ${invoice.month}/${invoice.year} invoice row for ${invoice.program.name}.`,
			labels: { confirm: 'Delete', cancel: 'Cancel' },
			confirmProps: { color: 'red' },
			onConfirm: async () => {
				await deleteInvoice({ id: invoice.id });
				notifications.show({
					title: 'Payment deleted',
					message: 'Invoice row deleted successfully',
					color: 'green',
				});
			},
		});
	};

	const handleMarkAsPaid = async (invoice: InvoiceRow) => {
		await updateInvoice({
			id: invoice.id,
			data: {
				year: invoice.year,
				month: invoice.month,
				studentCount: invoice.studentCount,
				session: invoice.session,
				registrationFee: invoice.registrationFee,
				tuitionFee: invoice.tuitionFee,
				bookFee: invoice.bookFee,
				paidRegistrationFee: invoice.registrationFee,
				paidTuitionFee: invoice.tuitionFee,
				paidBookFee: invoice.bookFee,
				extraPaid: invoice.extraPaid,
				payMethod: invoice.payMethod,
				paymentStatus: 'PAID',
				paidAt: dayjs().toISOString(),
				notes: invoice.notes,
			},
		});

		notifications.show({
			title: 'Marked as paid',
			message: 'Invoice paid fields were filled from fee values',
			color: 'green',
		});
	};

	const loadingRows = Array.from({ length: 8 }).map((_, index) => (
		<Table.Tr key={index}>
			{Array.from({ length: 10 }).map((_, columnIndex) => (
				<Table.Td key={columnIndex}>
					<Skeleton h={28} />
				</Table.Td>
			))}
		</Table.Tr>
	));

	const rows = invoices?.data.map((invoice, index) => {
		const methodLabel = PAY_METHOD_LABELS[invoice.payMethod] || invoice.payMethod;
		const statusLabel = PAYMENT_STATUS_LABELS[invoice.paymentStatus] || invoice.paymentStatus;
		const balanceColor = invoice.balance > 0 ? 'red.7' : 'green.7';

		return (
			<Table.Tr
				key={invoice.id}
				style={{ cursor: 'pointer' }}
				onClick={() => openDetail(invoice)}
			>
				<Table.Td>{(page - 1) * PAGE_SIZE + index + 1}</Table.Td>
				<Table.Td>
					<Stack gap={2}>
						<Text fw={500}>{invoice.family.name}</Text>
						<Text fz="xs" c="dimmed">
							{invoice.family.primaryPhone || '-'}
						</Text>
					</Stack>
				</Table.Td>
				<Table.Td>
					<Badge variant="light">{invoice.program.name}</Badge>
				</Table.Td>
				<Table.Td ta="center">{invoice.studentCount}</Table.Td>
				<Table.Td ta="right">{formatMoney(invoice.totalDue)}</Table.Td>
				<Table.Td ta="right">{formatMoney(invoice.totalPaid)}</Table.Td>
				<Table.Td ta="right">
					<Text c={balanceColor} fw={700} span>
						{formatMoney(invoice.balance)}
					</Text>
				</Table.Td>
				<Table.Td>
					<Badge variant="light">{methodLabel}</Badge>
				</Table.Td>
				<Table.Td>
					<Badge color={PAYMENT_STATUS_COLORS[invoice.paymentStatus]} variant="light">
						{statusLabel}
					</Badge>
				</Table.Td>
				<Table.Td>
					<Group
						gap={4}
						justify="center"
						wrap="nowrap"
						onClick={(event) => event.stopPropagation()}
					>
						<Tooltip label="View details">
							<ActionIcon variant="subtle" onClick={() => openDetail(invoice)}>
								<IconEye size={15} />
							</ActionIcon>
						</Tooltip>
						<Tooltip label="Edit">
							<ActionIcon variant="subtle" onClick={() => handleEdit(invoice)}>
								<IconEdit size={15} />
							</ActionIcon>
						</Tooltip>
						<Tooltip label="Mark as paid">
							<ActionIcon
								variant="subtle"
								color="green"
								disabled={isUpdating}
								onClick={() => handleMarkAsPaid(invoice)}
							>
								<IconCheck size={15} />
							</ActionIcon>
						</Tooltip>
						<Tooltip label="Delete">
							<ActionIcon
								variant="subtle"
								color="red"
								disabled={isDeleting}
								onClick={() => handleDelete(invoice)}
							>
								<IconTrash size={15} />
							</ActionIcon>
						</Tooltip>
					</Group>
				</Table.Td>
			</Table.Tr>
		);
	});

	const hasData = Boolean(invoices?.total);
	const hasPagination = (invoices?.total || 0) > PAGE_SIZE;

	return (
		<Stack>
			<Grid>
				<Grid.Col span={{ base: 12, md: 3 }}>
					<Paper p="md" withBorder>
						<Text c="dimmed" size="sm">
							Students
						</Text>
						<Text fw={700} size="lg">
							{invoices?.summary.studentCount || 0}
						</Text>
					</Paper>
				</Grid.Col>
				<Grid.Col span={{ base: 12, md: 3 }}>
					<Paper p="md" withBorder>
						<Text c="dimmed" size="sm">
							Total Due
						</Text>
						<Text fw={700} size="lg">
							{formatMoney(invoices?.summary.totalDue || 0)}
						</Text>
					</Paper>
				</Grid.Col>
				<Grid.Col span={{ base: 12, md: 3 }}>
					<Paper p="md" withBorder>
						<Text c="dimmed" size="sm">
							Total Paid
						</Text>
						<Text fw={700} size="lg">
							{formatMoney(invoices?.summary.totalPaid || 0)}
						</Text>
					</Paper>
				</Grid.Col>
				<Grid.Col span={{ base: 12, md: 3 }}>
					<Paper p="md" withBorder>
						<Text c="dimmed" size="sm">
							Balance
						</Text>
						<Text fw={700} size="lg">
							{formatMoney(invoices?.summary.balance || 0)}
						</Text>
					</Paper>
				</Grid.Col>
			</Grid>

			<Paper p="md" withBorder>
				{isError && (
					<Alert color="red" mb="md" icon={<IconAlertCircle size={16} />}>
						{error.message}
					</Alert>
				)}

				<SimpleGrid cols={{ base: 1, sm: 2, md: 3, lg: 6 }} mb="md">
					<Select
						placeholder="Year"
						clearable
						data={Array.from({ length: 8 }).map((_, index) => {
							const year = currentDate.getFullYear() - 2 + index;
							return { value: String(year), label: String(year) };
						})}
						value={String(filter.year)}
						onChange={(value) =>
							handleChangeFilter('year', Number(value || currentDate.getFullYear()))
						}
					/>
					<Select
						placeholder="Month"
						clearable
						data={MONTH_OPTIONS}
						value={String(filter.month)}
						onChange={(value) =>
							handleChangeFilter('month', Number(value || currentDate.getMonth() + 1))
						}
					/>
					<Select
						placeholder="All programs"
						clearable
						searchable
						data={programs?.data.map((program) => ({ value: program.id, label: program.name }))}
						value={filter.programId || null}
						onChange={(value) => handleChangeFilter('programId', value || undefined)}
					/>
					<Select
						placeholder="All families"
						clearable
						searchable
						data={families?.data.map((family) => ({ value: family.id, label: family.name }))}
						value={filter.familyId || null}
						onChange={(value) => handleChangeFilter('familyId', value || undefined)}
					/>
					<Select
						placeholder="All methods"
						clearable
						data={PAY_METHOD_OPTIONS}
						value={filter.payMethod || null}
						onChange={(value) => handleChangeFilter('payMethod', value || undefined)}
					/>
					<Select
						placeholder="All statuses"
						clearable
						data={PAYMENT_STATUS_OPTIONS}
						value={filter.paymentStatus || null}
						onChange={(value) => handleChangeFilter('paymentStatus', value || undefined)}
					/>
					<TextInput
						leftSection={<IconSearch size={16} />}
						placeholder="Search family name or phone"
						onChange={(event) => debounceChangeKeyword(event.target.value)}
					/>
				</SimpleGrid>

				<Group mb="md" justify="flex-end" wrap="wrap">
					<Button variant="default" leftSection={<IconPlus size={16} />} onClick={handleCreate}>
						Add payment row
					</Button>
					<GenerateMonthButton
						year={filter.year}
						month={filter.month}
						programId={filter.programId}
						programLabel={selectedProgram?.name}
					/>
				</Group>

				<Table.ScrollContainer minWidth={1100}>
					<Table
						striped="even"
						highlightOnHover
						withTableBorder
						verticalSpacing="sm"
						horizontalSpacing="md"
					>
						<Table.Thead>
							<Table.Tr>
								<Table.Th>#</Table.Th>
								<Table.Th>Family</Table.Th>
								<Table.Th>Program</Table.Th>
								<Table.Th ta="center">#Kids</Table.Th>
								<Table.Th ta="right">Total Due</Table.Th>
								<Table.Th ta="right">Total Paid</Table.Th>
								<Table.Th ta="right">Balance</Table.Th>
								<Table.Th>Method</Table.Th>
								<Table.Th>Status</Table.Th>
								<Table.Th ta="center">Actions</Table.Th>
							</Table.Tr>
						</Table.Thead>
						<Table.Tbody>
							{isLoading ? (
								loadingRows
							) : hasData ? (
								rows
							) : (
								<Table.Tr>
									<Table.Td colSpan={10}>
										<Center h={200}>
											<Stack align="center">
												<IconMoodEmpty size={40} color="var(--theme-primary-color)" />
												<Text fw={600}>No payments found</Text>
												<Button onClick={handleCreate}>Add payment row</Button>
											</Stack>
										</Center>
									</Table.Td>
								</Table.Tr>
							)}
						</Table.Tbody>
						<Table.Tfoot>
							<Table.Tr>
								<Table.Td colSpan={3} fw={700}>
									Sum:
								</Table.Td>
								<Table.Td ta="center">{invoices?.summary.studentCount || 0}</Table.Td>
								<Table.Td ta="right">{formatMoney(invoices?.summary.totalDue || 0)}</Table.Td>
								<Table.Td ta="right">{formatMoney(invoices?.summary.totalPaid || 0)}</Table.Td>
								<Table.Td ta="right">
									<Text c={(invoices?.summary.balance || 0) > 0 ? 'red.7' : 'green.7'} fw={700} span>
										{formatMoney(invoices?.summary.balance || 0)}
									</Text>
								</Table.Td>
								<Table.Td colSpan={3} />
							</Table.Tr>
						</Table.Tfoot>
					</Table>
				</Table.ScrollContainer>

				{hasPagination && (
					<Group justify="flex-end" mt="md">
						<Pagination
							total={Math.ceil((invoices?.total || 0) / PAGE_SIZE)}
							value={page}
							onChange={setPage}
						/>
					</Group>
				)}
			</Paper>
		</Stack>
	);
};
