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
	Skeleton,
	Stack,
	Table,
	Text,
	TextInput,
} from '@mantine/core';
import { useDebouncedCallback } from '@mantine/hooks';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';

import {
	IconAlertCircle,
	IconCheck,
	IconEdit,
	IconMoodEmpty,
	IconPlus,
	IconSearch,
	IconTrash,
} from '@tabler/icons-react';
import dayjs from 'dayjs';

import {
	MONTH_OPTIONS,
	PAY_METHOD_OPTIONS,
	PAYMENT_STATUS_COLORS,
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
import { PaymentFormModal } from './PaymentFormModal';

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
		limit: 10,
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

	const loadingRows = Array.from({ length: 10 }).map((_, index) => (
		<Table.Tr key={index}>
			{Array.from({ length: 20 }).map((_, columnIndex) => (
				<Table.Td key={columnIndex}>
					<Skeleton h={28} />
				</Table.Td>
			))}
		</Table.Tr>
	));

	const rows = invoices?.data.map((invoice, index) => (
		<Table.Tr key={invoice.id}>
			<Table.Td>{(page - 1) * 10 + index + 1}</Table.Td>
			<Table.Td>{invoice.family.name}</Table.Td>
			<Table.Td>{invoice.program.name}</Table.Td>
			<Table.Td ta="center">{invoice.studentCount}</Table.Td>
			<Table.Td>{invoice.session || '-'}</Table.Td>
			<Table.Td>{formatMoney(invoice.registrationFee)}</Table.Td>
			<Table.Td>{formatMoney(invoice.tuitionFee)}</Table.Td>
			<Table.Td>{formatMoney(invoice.bookFee)}</Table.Td>
			<Table.Td>{formatMoney(invoice.totalDue)}</Table.Td>
			<Table.Td>{formatMoney(invoice.paidRegistrationFee)}</Table.Td>
			<Table.Td>{formatMoney(invoice.paidTuitionFee)}</Table.Td>
			<Table.Td>{formatMoney(invoice.paidBookFee)}</Table.Td>
			<Table.Td>{formatMoney(invoice.extraPaid)}</Table.Td>
			<Table.Td>{formatMoney(invoice.totalPaid)}</Table.Td>
			<Table.Td>{formatMoney(invoice.balance)}</Table.Td>
			<Table.Td>{invoice.payMethod}</Table.Td>
			<Table.Td>
				<Badge color={PAYMENT_STATUS_COLORS[invoice.paymentStatus]}>
					{invoice.paymentStatus}
				</Badge>
			</Table.Td>
			<Table.Td>{invoice.paidAt ? dayjs(invoice.paidAt).format('MM/DD/YYYY') : '-'}</Table.Td>
			<Table.Td>{invoice.notes || '-'}</Table.Td>
			<Table.Td>
				<Group gap={4} wrap="nowrap">
					<ActionIcon variant="subtle" onClick={() => handleEdit(invoice)}>
						<IconEdit size={15} />
					</ActionIcon>
					<ActionIcon
						variant="subtle"
						color="green"
						disabled={isUpdating}
						onClick={() => handleMarkAsPaid(invoice)}
					>
						<IconCheck size={15} />
					</ActionIcon>
					<ActionIcon
						variant="subtle"
						color="red"
						disabled={isDeleting}
						onClick={() => handleDelete(invoice)}
					>
						<IconTrash size={15} />
					</ActionIcon>
				</Group>
			</Table.Td>
		</Table.Tr>
	));

	const hasData = Boolean(invoices?.total);
	const hasPagination = (invoices?.total || 0) > 10;

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

				<Group mb="md" justify="space-between" wrap="wrap">
					<Group wrap="wrap">
						<Button leftSection={<IconPlus size={16} />} onClick={handleCreate}>
							Add payment row
						</Button>
						<GenerateMonthButton
							year={filter.year}
							month={filter.month}
							programId={filter.programId}
							programLabel={selectedProgram?.name}
						/>
					</Group>
				</Group>

				<Group mb="md" wrap="wrap">
					<Select
						label="Year"
						w={120}
						data={Array.from({ length: 8 }).map((_, index) => {
							const year = currentDate.getFullYear() - 2 + index;
							return { value: String(year), label: String(year) };
						})}
						value={String(filter.year)}
						onChange={(value) => handleChangeFilter('year', Number(value || currentDate.getFullYear()))}
					/>
					<Select
						label="Month"
						w={170}
						data={MONTH_OPTIONS}
						value={String(filter.month)}
						onChange={(value) => handleChangeFilter('month', Number(value || currentDate.getMonth() + 1))}
					/>
					<Select
						label="Program"
						w={180}
						clearable
						searchable
						data={programs?.data.map((program) => ({ value: program.id, label: program.name }))}
						value={filter.programId || null}
						onChange={(value) => handleChangeFilter('programId', value || undefined)}
					/>
					<Select
						label="Family"
						w={220}
						clearable
						searchable
						data={families?.data.map((family) => ({ value: family.id, label: family.name }))}
						value={filter.familyId || null}
						onChange={(value) => handleChangeFilter('familyId', value || undefined)}
					/>
					<Select
						label="Pay Method"
						w={150}
						clearable
						data={PAY_METHOD_OPTIONS}
						value={filter.payMethod || null}
						onChange={(value) => handleChangeFilter('payMethod', value || undefined)}
					/>
					<Select
						label="Status"
						w={150}
						clearable
						data={PAYMENT_STATUS_OPTIONS}
						value={filter.paymentStatus || null}
						onChange={(value) => handleChangeFilter('paymentStatus', value || undefined)}
					/>
					<TextInput
						label="Search"
						leftSection={<IconSearch size={16} />}
						placeholder="Family name or phone"
						onChange={(event) => debounceChangeKeyword(event.target.value)}
						w={260}
					/>
				</Group>

				<Table.ScrollContainer minWidth={2000}>
					<Table bg="white" border={1}>
						<Table.Thead>
							<Table.Tr>
								<Table.Th>#</Table.Th>
								<Table.Th>Family</Table.Th>
								<Table.Th>Program</Table.Th>
								<Table.Th>#Kids</Table.Th>
								<Table.Th>Session</Table.Th>
								<Table.Th>Reg</Table.Th>
								<Table.Th>Tuition</Table.Th>
								<Table.Th>Books</Table.Th>
								<Table.Th>Total Due</Table.Th>
								<Table.Th>Paid Reg</Table.Th>
								<Table.Th>Paid Tuition</Table.Th>
								<Table.Th>Paid Books</Table.Th>
								<Table.Th>Extra</Table.Th>
								<Table.Th>Total Paid</Table.Th>
								<Table.Th>Balance</Table.Th>
								<Table.Th>Method</Table.Th>
								<Table.Th>Status</Table.Th>
								<Table.Th>Paid At</Table.Th>
								<Table.Th>Notes</Table.Th>
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
									<Table.Td colSpan={20}>
										<Center h={220}>
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
								<Table.Td colSpan={5} fw={700}>
									Sum:
								</Table.Td>
								<Table.Td>{formatMoney(invoices?.summary.registrationFee || 0)}</Table.Td>
								<Table.Td>{formatMoney(invoices?.summary.tuitionFee || 0)}</Table.Td>
								<Table.Td>{formatMoney(invoices?.summary.bookFee || 0)}</Table.Td>
								<Table.Td>{formatMoney(invoices?.summary.totalDue || 0)}</Table.Td>
								<Table.Td>{formatMoney(invoices?.summary.paidRegistrationFee || 0)}</Table.Td>
								<Table.Td>{formatMoney(invoices?.summary.paidTuitionFee || 0)}</Table.Td>
								<Table.Td>{formatMoney(invoices?.summary.paidBookFee || 0)}</Table.Td>
								<Table.Td>{formatMoney(invoices?.summary.extraPaid || 0)}</Table.Td>
								<Table.Td>{formatMoney(invoices?.summary.totalPaid || 0)}</Table.Td>
								<Table.Td>{formatMoney(invoices?.summary.balance || 0)}</Table.Td>
								<Table.Td colSpan={5} />
							</Table.Tr>
						</Table.Tfoot>
					</Table>
				</Table.ScrollContainer>

				{hasPagination && (
					<Group justify="flex-end" mt="md">
						<Pagination
							total={Math.ceil((invoices?.total || 0) / 10)}
							value={page}
							onChange={setPage}
						/>
					</Group>
				)}
			</Paper>
		</Stack>
	);
};
