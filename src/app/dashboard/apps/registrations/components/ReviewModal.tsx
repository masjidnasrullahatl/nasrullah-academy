import { useEffect, useState } from 'react';

import {
	Alert,
	Badge,
	Button,
	Divider,
	Grid,
	Group,
	Loader,
	Radio,
	Select,
	Stack,
	Table,
	Text,
} from '@mantine/core';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';

import { IconAlertCircle, IconCheck, IconX } from '@tabler/icons-react';
import dayjs from 'dayjs';

import { ModalFooter } from '@components/ModalFooter';

import { useGetPagingFamilies } from '@hooks/react-query/families/useGetPagingFamilies';
import { useGetRegistrationDetail } from '@hooks/react-query/registrations/useGetRegistrationDetail';
import { useReviewRegistration } from '@hooks/react-query/registrations/useReviewRegistration';

import { formatMoney } from '@utils/money';

import { paymentLabel, STATUS_COLORS, STATUS_LABELS } from './utils';

type Props = {
	id: string;
};

const Field = ({ label, value }: { label: string; value?: string | null }) => (
	<div>
		<Text size="xs" c="dimmed">
			{label}
		</Text>
		<Text size="sm">{value || '-'}</Text>
	</div>
);

export const ReviewModal = ({ id }: Props) => {
	const { data: registration, isLoading } = useGetRegistrationDetail(id);
	const { data: families } = useGetPagingFamilies({ page: 1, limit: 1000 });
	const { mutateAsync: review, isPending, error } = useReviewRegistration();

	const [target, setTarget] = useState<'new' | 'existing'>('new');
	const [familyId, setFamilyId] = useState<string | null>(null);

	useEffect(() => {
		if (registration?.matchedFamily) {
			setTarget('existing');
			setFamilyId(registration.matchedFamily.id);
		}
	}, [registration?.matchedFamily]);

	if (isLoading || !registration) return <Loader />;

	const canReview = registration.status === 'PENDING';

	const handleApprove = async () => {
		await review({
			id,
			action: 'approve',
			familyId: target === 'existing' ? familyId : null,
		});

		notifications.show({
			title: 'Registration approved',
			message: 'Family, students and this month\'s payment row were set up',
			color: 'green',
		});

		modals.closeAll();
	};

	const handleReject = () => {
		modals.openConfirmModal({
			title: 'Reject this registration?',
			children: 'Nothing will be added to families or students.',
			labels: { confirm: 'Reject', cancel: 'Cancel' },
			confirmProps: { color: 'red' },
			onConfirm: async () => {
				await review({ id, action: 'reject' });
				notifications.show({
					title: 'Registration rejected',
					message: 'The registration was marked as rejected',
					color: 'gray',
				});
				modals.closeAll();
			},
		});
	};

	return (
		<Stack>
			<Group justify="space-between">
				<Group gap="xs">
					<Badge variant="light" size="lg">
						{registration.program.name}
					</Badge>
					<Badge color={STATUS_COLORS[registration.status]} size="lg">
						{STATUS_LABELS[registration.status]}
					</Badge>
				</Group>
				<Text size="sm" c="dimmed">
					Submitted {dayjs(registration.createdAt).format('MM/DD/YYYY h:mm A')}
				</Text>
			</Group>

			{error && (
				<Alert color="red" icon={<IconAlertCircle size={16} />}>
					{error.message}
				</Alert>
			)}

			<Grid>
				<Grid.Col span={{ base: 6, md: 4 }}>
					<Field label="Family / Parent name" value={registration.familyName} />
				</Grid.Col>
				<Grid.Col span={{ base: 6, md: 4 }}>
					<Field label="Father name" value={registration.fatherName} />
				</Grid.Col>
				<Grid.Col span={{ base: 6, md: 4 }}>
					<Field label="Mother name" value={registration.motherName} />
				</Grid.Col>
				<Grid.Col span={{ base: 6, md: 4 }}>
					<Field label="Primary phone" value={registration.phone} />
				</Grid.Col>
				<Grid.Col span={{ base: 6, md: 4 }}>
					<Field label="Secondary phone" value={registration.secondaryPhone} />
				</Grid.Col>
				<Grid.Col span={{ base: 6, md: 4 }}>
					<Field label="Email" value={registration.email} />
				</Grid.Col>
				<Grid.Col span={{ base: 12, md: 8 }}>
					<Field label="Address" value={registration.address} />
				</Grid.Col>
				{registration.preferredTime && (
					<Grid.Col span={{ base: 12, md: 4 }}>
						<Field label="Preferred class time" value={registration.preferredTime} />
					</Grid.Col>
				)}
				{registration.notes && (
					<Grid.Col span={12}>
						<Field label="Notes" value={registration.notes} />
					</Grid.Col>
				)}
			</Grid>

			<Table withTableBorder withColumnBorders>
				<Table.Thead>
					<Table.Tr>
						<Table.Th>Student</Table.Th>
						<Table.Th>Gender</Table.Th>
						<Table.Th>Date of birth</Table.Th>
						<Table.Th>Health</Table.Th>
						<Table.Th>Notes</Table.Th>
					</Table.Tr>
				</Table.Thead>
				<Table.Tbody>
					{registration.students.map((student, index) => (
						<Table.Tr key={index}>
							<Table.Td>
								{student.firstName} {student.lastName}
							</Table.Td>
							<Table.Td>{student.gender === 'BOY' ? 'Boy' : 'Girl'}</Table.Td>
							<Table.Td>
								{dayjs(student.dateOfBirth.slice(0, 10)).format('MM/DD/YYYY')}
							</Table.Td>
							<Table.Td>
								{[
									student.allergies && `Allergies: ${student.allergies}`,
									student.medicalConditions &&
										`Medical: ${student.medicalConditions}`,
									student.medications && `Other: ${student.medications}`,
								]
									.filter(Boolean)
									.join(' · ') || 'None'}
							</Table.Td>
							<Table.Td>{student.notes || '-'}</Table.Td>
						</Table.Tr>
					))}
				</Table.Tbody>
			</Table>

			<Group gap="xl">
				<Field
					label="Registration fee"
					value={formatMoney(registration.registrationFee)}
				/>
				<Field label="Monthly tuition" value={formatMoney(registration.monthlyFee)} />
				<Field label="Due now" value={formatMoney(registration.amountDue)} />
				<Field label="Payment" value={paymentLabel(registration)} />
			</Group>

			<Text size="sm" c={registration.rulesAcceptedAt ? 'green.8' : 'red'}>
				{registration.rulesAcceptedAt
					? `School rules accepted and signed by "${registration.rulesSignature}" on ${dayjs(registration.rulesAcceptedAt).format('MM/DD/YYYY')}`
					: 'School rules were not accepted on this registration'}
			</Text>

			{canReview ? (
				<>
					<Divider label="Add to" labelPosition="left" />

					<Radio.Group
						value={target}
						onChange={(value) => setTarget(value as 'new' | 'existing')}
					>
						<Stack gap="xs">
							<Radio
								value="existing"
								label={
									registration.matchedFamily
										? `Existing family (matched by phone/email): ${registration.matchedFamily.name}`
										: 'An existing family'
								}
							/>
							{target === 'existing' && (
								<Select
									ml="xl"
									searchable
									placeholder="Select family"
									data={families?.data.map((family) => ({
										value: family.id,
										label: `${family.name} (${family.primaryPhone})`,
									}))}
									value={familyId}
									onChange={setFamilyId}
								/>
							)}
							<Radio
								value="new"
								label={`New family: ${registration.familyName}`}
							/>
						</Stack>
					</Radio.Group>

					<Text size="xs" c="dimmed">
						Approving adds the students to the family with this program, sets the
						family&apos;s kids and monthly fee for the program, and adds the
						registration fee to this month&apos;s payment row.
					</Text>

					<ModalFooter>
						<Button
							variant="default"
							color="red"
							leftSection={<IconX size={16} />}
							onClick={handleReject}
							disabled={isPending}
						>
							Reject
						</Button>
						<Button
							color="green"
							leftSection={<IconCheck size={16} />}
							loading={isPending}
							disabled={target === 'existing' && !familyId}
							onClick={handleApprove}
						>
							Approve
						</Button>
					</ModalFooter>
				</>
			) : (
				registration.family && (
					<Text size="sm">
						Added to family <b>{registration.family.name}</b>
						{registration.reviewedAt &&
							` on ${dayjs(registration.reviewedAt).format('MM/DD/YYYY')}`}
					</Text>
				)
			)}
		</Stack>
	);
};
