'use client';

import { useParams } from 'next/navigation';

import { useMemo, useState } from 'react';

import {
	ActionIcon,
	Anchor,
	Badge,
	Button,
	Container,
	Grid,
	Group,
	Pagination,
	Paper,
	Select,
	Stack,
	Table,
	Text,
} from '@mantine/core';
import { modals } from '@mantine/modals';

import { IconEdit, IconTrash } from '@tabler/icons-react';
import dayjs from 'dayjs';

import PageHeader from '@components/PageHeader';

import { MONTH_OPTIONS } from '@configs/enums';
import { PATH_APPS, PATH_DASHBOARD } from '@configs/routes';

import { useGetFamilyDetail } from '@hooks/react-query/families/useGetFamilyDetail';
import { useGetPagingInvoices } from '@hooks/react-query/invoices/useGetPagingInvoices';
import { useDeleteStudent } from '@hooks/react-query/students/useDeleteStudent';

import { formatMoney } from '@utils/money';

import { StudentFormModal } from '../../students/components/StudentFormModal';
import { FamilyFormModal } from '../components/FamilyFormModal';

const calcAge = (dateOfBirth?: string | null) => {
	if (!dateOfBirth) {
		return '-';
	}

	return dayjs().diff(dayjs(dateOfBirth), 'year');
};

export default function FamilyDetailPage() {
	const params = useParams<{ id: string }>();
	const familyId = params.id;
	const currentDate = new Date();

	const [invoicePage, setInvoicePage] = useState(1);
	const [invoiceYear, setInvoiceYear] = useState(currentDate.getFullYear());
	const [invoiceMonth, setInvoiceMonth] = useState<number | undefined>();

	const { data: family } = useGetFamilyDetail(familyId);
	const { data: invoices, isLoading: isLoadingInvoices } = useGetPagingInvoices(
		{
			page: invoicePage,
			limit: 10,
			familyId,
			year: invoiceYear,
			month: invoiceMonth,
		},
	);
	const { mutateAsync: deleteStudent, isPending: isDeletingStudent } =
		useDeleteStudent();

	const items = useMemo(
		() =>
			[
				{ title: 'Dashboard', href: PATH_DASHBOARD.default },
				{ title: 'Apps', href: PATH_APPS.root },
				{ title: 'Families', href: PATH_APPS.families },
				{
					title: family?.name || 'Family detail',
					href: `${PATH_APPS.families}/${familyId}`,
				},
			].map((item, index) => (
				<Anchor href={item.href} key={index}>
					{item.title}
				</Anchor>
			)),
		[family?.name, familyId],
	);

	const handleEditFamily = () => {
		if (!family) {
			return;
		}

		modals.open({
			title: 'Edit Family',
			size: 'xl',
			children: <FamilyFormModal family={family} />,
		});
	};

	const handleEditStudent = (student: any) => {
		modals.open({
			title: 'Edit Student',
			size: 'lg',
			children: (
				<StudentFormModal student={student} defaultFamilyId={familyId} />
			),
		});
	};

	const handleDeleteStudent = (student: any) => {
		modals.openConfirmModal({
			title: `Delete ${student.firstName} ${student.lastName}?`,
			children:
				'This removes the student record from this family and all related class enrollments.',
			labels: { confirm: 'Delete', cancel: 'Cancel' },
			confirmProps: { color: 'red' },
			onConfirm: async () => {
				await deleteStudent({ id: student.id });
			},
		});
	};

	const hasInvoicePagination = (invoices?.total || 0) > 10;

	return (
		<>
			<title>Family Detail | Nasrullah Academy</title>
			<Container fluid>
				<Stack>
					<PageHeader
						title={family?.name || 'Family Detail'}
						breadcrumbItems={items}
						actionButton={
							<Button
								leftSection={<IconEdit size={16} />}
								onClick={handleEditFamily}
							>
								Edit Family
							</Button>
						}
					/>

					<Paper p="md">
						<Grid>
							<Grid.Col span={{ base: 12, md: 4 }}>
								<Text fw={700}>Primary Phone</Text>
								<Text>{family?.primaryPhone || '-'}</Text>
							</Grid.Col>
							<Grid.Col span={{ base: 12, md: 4 }}>
								<Text fw={700}>Secondary Phone</Text>
								<Text>{family?.secondaryPhone || '-'}</Text>
							</Grid.Col>
							<Grid.Col span={{ base: 12, md: 4 }}>
								<Text fw={700}>Email</Text>
								<Text>{family?.email || '-'}</Text>
							</Grid.Col>
							<Grid.Col span={{ base: 12, md: 8 }}>
								<Text fw={700}>Address</Text>
								<Text>{family?.address || '-'}</Text>
							</Grid.Col>
							<Grid.Col span={{ base: 12, md: 2 }}>
								<Text fw={700}>Status</Text>
								<Badge color={family?.status === 'ACTIVE' ? 'green' : 'gray'}>
									{family?.status || '-'}
								</Badge>
							</Grid.Col>
							<Grid.Col span={{ base: 12, md: 2 }}>
								<Text fw={700}>Notes</Text>
								<Text>{family?.notes || '-'}</Text>
							</Grid.Col>
						</Grid>
					</Paper>

					<Paper p="md">
						<Text fw={700} mb="sm">
							Students
						</Text>
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
										<Table.Th>Name</Table.Th>
										<Table.Th>Gender</Table.Th>
										<Table.Th>Date of birth</Table.Th>
										<Table.Th>Age</Table.Th>
										<Table.Th>Enrolled classes</Table.Th>
										<Table.Th>Teacher</Table.Th>
										<Table.Th>Status</Table.Th>
										<Table.Th ta="center">Actions</Table.Th>
									</Table.Tr>
								</Table.Thead>
								<Table.Tbody>
									{family?.students?.map((student: any) => (
										<Table.Tr key={student.id}>
											<Table.Td>{`${student.firstName} ${student.lastName}`}</Table.Td>
											<Table.Td>{student.gender}</Table.Td>
											<Table.Td>
												{student.dateOfBirth
													? dayjs(student.dateOfBirth).format('MM/DD/YYYY')
													: '-'}
											</Table.Td>
											<Table.Td>{calcAge(student.dateOfBirth)}</Table.Td>
											<Table.Td>
												<Group gap={4}>
													{student.enrollments?.map((enrollment: any) => (
														<Badge key={enrollment.id} variant="light">
															{enrollment.class.name}
														</Badge>
													))}
												</Group>
											</Table.Td>
											<Table.Td>
												{student.enrollments
													?.map((enrollment: any) => {
														const teacher = enrollment.class.teacher;
														return teacher
															? `${teacher.firstName} ${teacher.lastName}`
															: '-';
													})
													.join(', ')}
											</Table.Td>
											<Table.Td>
												<Badge
													color={student.status === 'ACTIVE' ? 'green' : 'gray'}
												>
													{student.status}
												</Badge>
											</Table.Td>
											<Table.Td>
												<Group gap="xs" justify="center">
													<ActionIcon
														onClick={() => handleEditStudent(student)}
													>
														<IconEdit size={16} />
													</ActionIcon>
													<ActionIcon
														color="red"
														onClick={() => handleDeleteStudent(student)}
														disabled={isDeletingStudent}
													>
														<IconTrash size={16} />
													</ActionIcon>
												</Group>
											</Table.Td>
										</Table.Tr>
									))}
								</Table.Tbody>
							</Table>
						</Table.ScrollContainer>
					</Paper>

					<Paper p="md">
						<Text fw={700} mb="xs">
							Monthly Invoices
						</Text>
						<Group mb="md" justify="space-between" wrap="wrap">
							<Group wrap="wrap">
								<Select
									label="Year"
									placeholder="Select year"
									w={120}
									data={Array.from({ length: 8 }).map((_, index) => {
										const year = currentDate.getFullYear() - 2 + index;
										return { value: String(year), label: String(year) };
									})}
									value={String(invoiceYear)}
									onChange={(value) => {
										setInvoiceYear(Number(value || currentDate.getFullYear()));
										setInvoicePage(1);
									}}
								/>
								<Select
									label="Month"
									placeholder="Select month"
									w={170}
									clearable
									data={MONTH_OPTIONS}
									value={invoiceMonth ? String(invoiceMonth) : null}
									onChange={(value) => {
										setInvoiceMonth(value ? Number(value) : undefined);
										setInvoicePage(1);
									}}
								/>
							</Group>
							<Text c="dimmed" size="sm">
								Total: {invoices?.total || 0}
							</Text>
						</Group>

						<Table.ScrollContainer minWidth={1000}>
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
										<Table.Th>Month</Table.Th>
										<Table.Th>Total Due</Table.Th>
										<Table.Th>Total Paid</Table.Th>
										<Table.Th>Balance</Table.Th>
										<Table.Th>Status</Table.Th>
										<Table.Th>Method</Table.Th>
										<Table.Th>Paid At</Table.Th>
									</Table.Tr>
								</Table.Thead>
								<Table.Tbody>
									{isLoadingInvoices ? (
										<Table.Tr>
											<Table.Td colSpan={8}>Loading invoices...</Table.Td>
										</Table.Tr>
									) : invoices?.data.length ? (
										invoices.data.map((invoice, index) => (
											<Table.Tr key={invoice.id}>
												<Table.Td>
													{(invoicePage - 1) * 10 + index + 1}
												</Table.Td>
												<Table.Td>
													{MONTH_OPTIONS.find(
														(month) => Number(month.value) === invoice.month,
													)?.label || invoice.month}
													/{invoice.year}
												</Table.Td>
												<Table.Td>{formatMoney(invoice.totalDue)}</Table.Td>
												<Table.Td>{formatMoney(invoice.totalPaid)}</Table.Td>
												<Table.Td>{formatMoney(invoice.balance)}</Table.Td>
												<Table.Td>
													<Badge
														color={
															invoice.paymentStatus === 'PAID'
																? 'green'
																: invoice.paymentStatus === 'PARTIAL'
																	? 'yellow'
																	: 'red'
														}
													>
														{invoice.paymentStatus}
													</Badge>
												</Table.Td>
												<Table.Td>{invoice.payMethod}</Table.Td>
												<Table.Td>
													{invoice.paidAt
														? dayjs(invoice.paidAt).format('MM/DD/YYYY')
														: '-'}
												</Table.Td>
											</Table.Tr>
										))
									) : (
										<Table.Tr>
											<Table.Td colSpan={8}>
												<Text c="dimmed" size="sm" ta="center">
													No invoices found for this family.
												</Text>
											</Table.Td>
										</Table.Tr>
									)}
								</Table.Tbody>
							</Table>
						</Table.ScrollContainer>

						{hasInvoicePagination && (
							<Group justify="flex-end" mt="md">
								<Pagination
									total={Math.ceil((invoices?.total || 0) / 10)}
									value={invoicePage}
									onChange={setInvoicePage}
								/>
							</Group>
						)}
					</Paper>
				</Stack>
			</Container>
		</>
	);
}
