import { useState } from 'react';

import {
	Alert,
	Anchor,
	Badge,
	Box,
	Button,
	Center,
	CopyButton,
	Group,
	Paper,
	SegmentedControl,
	Skeleton,
	Stack,
	Table,
	Text,
	TextInput,
} from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import { modals } from '@mantine/modals';

import { RegistrationStatus } from '@prisma/client';
import { IconAlertCircle, IconClipboardList, IconSearch } from '@tabler/icons-react';
import dayjs from 'dayjs';

import {
	DEFAULT_PAGE_SIZE,
	TablePagination,
} from '@components/TablePagination';

import {
	RegistrationRow,
	useGetPagingRegistrations,
} from '@hooks/react-query/registrations/useGetPagingRegistrations';

import { formatMoney } from '@utils/money';

import { ReviewModal } from './ReviewModal';
import { paymentLabel, STATUS_COLORS, STATUS_LABELS } from './utils';

const STATUS_TABS = [
	{ value: 'PENDING', label: 'Pending' },
	{ value: 'APPROVED', label: 'Approved' },
	{ value: 'REJECTED', label: 'Rejected' },
	{ value: '', label: 'All' },
];

const COLUMNS = 9;

export const DataTable = () => {
	const [page, setPage] = useState(1);
	const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
	const [status, setStatus] = useState<string>('PENDING');
	const [keyword, setKeyword] = useState('');
	const [debouncedKeyword] = useDebouncedValue(keyword, 400);

	const { data, isLoading, isError, error } = useGetPagingRegistrations({
		page,
		limit: pageSize,
		status: (status || undefined) as RegistrationStatus | undefined,
		keyword: debouncedKeyword,
	});

	const handleReview = (registration: RegistrationRow) => {
		modals.open({
			title: `Registration: ${registration.parentFirstName} ${registration.parentLastName}`,
			size: 'xl',
			children: <ReviewModal id={registration.id} />,
		});
	};

	const registerLink =
		typeof window !== 'undefined' ? `${window.location.origin}/register` : '';

	return (
		<Paper p="md">
			{isError && (
				<Alert color="red" mb="md" icon={<IconAlertCircle size={16} />}>
					{error.message}
				</Alert>
			)}

			<Group mb="md" justify="space-between">
				<SegmentedControl
					data={STATUS_TABS.map((tab) => ({
						value: tab.value,
						label:
							tab.value === 'PENDING' && data?.pendingCount
								? `Pending (${data.pendingCount})`
								: tab.label,
					}))}
					value={status}
					onChange={(value) => {
						setStatus(value);
						setPage(1);
					}}
				/>

				<Group>
					<TextInput
						leftSection={<IconSearch size={16} />}
						placeholder="Search parent, email or phone"
						value={keyword}
						onChange={(event) => {
							setKeyword(event.currentTarget.value);
							setPage(1);
						}}
					/>
					<CopyButton value={registerLink}>
						{({ copied, copy }) => (
							<Button variant="default" onClick={copy}>
								{copied ? 'Link copied' : 'Copy registration link'}
							</Button>
						)}
					</CopyButton>
				</Group>
			</Group>

			<Table.ScrollContainer minWidth={1100}>
				<Table
					striped="even"
					highlightOnHover
					withTableBorder
					withColumnBorders
					verticalSpacing="sm"
					horizontalSpacing="md"
				>
					<Table.Thead>
						<Table.Tr>
							<Table.Th w={50}>#</Table.Th>
							<Table.Th>Submitted</Table.Th>
							<Table.Th>Parent</Table.Th>
							<Table.Th>Contact</Table.Th>
							<Table.Th>Program</Table.Th>
							<Table.Th>Students</Table.Th>
							<Table.Th ta="right">Due now</Table.Th>
							<Table.Th>Payment</Table.Th>
							<Table.Th>Status</Table.Th>
						</Table.Tr>
					</Table.Thead>

					<Table.Tbody>
						{isLoading ? (
							Array.from({ length: 5 }).map((_, index) => (
								<Table.Tr key={index}>
									<Table.Td colSpan={COLUMNS}>
										<Skeleton h={28} />
									</Table.Td>
								</Table.Tr>
							))
						) : data?.total ? (
							data.data.map((registration, index) => (
								<Table.Tr
									key={registration.id}
									style={{ cursor: 'pointer' }}
									onClick={() => handleReview(registration)}
								>
									<Table.Td>{(page - 1) * pageSize + index + 1}</Table.Td>
									<Table.Td>
										{dayjs(registration.createdAt).format('MM/DD/YYYY h:mm A')}
									</Table.Td>
									<Table.Td>
										<Anchor component="button" size="sm">
											{registration.parentFirstName} {registration.parentLastName}
										</Anchor>
										{registration.family && (
											<Text size="xs" c="dimmed">
												Family: {registration.family.name}
											</Text>
										)}
									</Table.Td>
									<Table.Td>
										<Text size="sm">{registration.phone}</Text>
										<Text size="xs" c="dimmed">
											{registration.email}
										</Text>
									</Table.Td>
									<Table.Td>
										<Badge variant="light">{registration.program.name}</Badge>
									</Table.Td>
									<Table.Td>
										<Text size="sm">
											{registration.students
												.map((student) => student.firstName)
												.join(', ')}
										</Text>
									</Table.Td>
									<Table.Td ta="right">
										{formatMoney(registration.amountDue)}
									</Table.Td>
									<Table.Td>
										<Text
											size="sm"
											c={registration.paymentStatus === 'PAID' ? 'green.8' : undefined}
										>
											{paymentLabel(registration)}
										</Text>
									</Table.Td>
									<Table.Td>
										<Badge color={STATUS_COLORS[registration.status]}>
											{STATUS_LABELS[registration.status]}
										</Badge>
									</Table.Td>
								</Table.Tr>
							))
						) : (
							<Table.Tr>
								<Table.Td colSpan={COLUMNS}>
									<Center h={220}>
										<Stack align="center" gap="xs">
											<IconClipboardList size={40} />
											<Text fw={600}>No registrations here</Text>
										</Stack>
									</Center>
								</Table.Td>
							</Table.Tr>
						)}
					</Table.Tbody>

					<Table.Tfoot>
						<Table.Tr>
							<Table.Td colSpan={COLUMNS}>
								<Box>
									<TablePagination
										total={data?.total || 0}
										page={page}
										pageSize={pageSize}
										setPage={setPage}
										setPageSize={setPageSize}
									/>
								</Box>
							</Table.Td>
						</Table.Tr>
					</Table.Tfoot>
				</Table>
			</Table.ScrollContainer>
		</Paper>
	);
};
