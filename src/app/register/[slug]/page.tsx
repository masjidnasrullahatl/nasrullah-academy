'use client';

import { useParams, useRouter } from 'next/navigation';

import { useEffect, useState } from 'react';

import {
	ActionIcon,
	Alert,
	Badge,
	Box,
	Button,
	Card,
	Divider,
	Grid,
	Group,
	Loader,
	Radio,
	SegmentedControl,
	Stack,
	Text,
	Textarea,
	TextInput,
	Title,
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { useForm } from '@mantine/form';

import {
	IconAlertCircle,
	IconCreditCard,
	IconPlus,
	IconTrash,
} from '@tabler/icons-react';
import dayjs from 'dayjs';

import { PublicProgram } from '@app/api/public/registrations/types';

import { formatMoney } from '@utils/money';
import { getRegistrationQuote } from '@utils/registrationPricing';

type StudentValue = {
	firstName: string;
	lastName: string;
	gender: 'BOY' | 'GIRL' | '';
	dateOfBirth: Date | null;
	notes: string;
};

type FormValue = {
	parentFirstName: string;
	parentLastName: string;
	email: string;
	phone: string;
	emergencyPhone: string;
	address: string;
	preferredTime: string;
	notes: string;
	students: StudentValue[];
	payByCard: 'card' | 'later';
	website: string;
};

const emptyStudent = (lastName = ''): StudentValue => ({
	firstName: '',
	lastName,
	gender: '',
	dateOfBirth: null,
	notes: '',
});

const required = (label: string) => (value: string) =>
	value.trim() ? null : `${label} is required`;

export default function ProgramRegistrationPage() {
	const { slug } = useParams<{ slug: string }>();
	const router = useRouter();

	const [program, setProgram] = useState<PublicProgram | null>(null);
	const [loadError, setLoadError] = useState('');
	const [submitError, setSubmitError] = useState('');
	const [isSubmitting, setIsSubmitting] = useState(false);

	useEffect(() => {
		fetch(`/api/public/programs/${slug}`)
			.then((response) => response.json())
			.then((result) => {
				if (result.data) setProgram(result.data);
				else setLoadError(result.error || 'Registration is not open');
			})
			.catch(() => setLoadError('Unable to load the registration form'));
	}, [slug]);

	const form = useForm<FormValue>({
		initialValues: {
			parentFirstName: '',
			parentLastName: '',
			email: '',
			phone: '',
			emergencyPhone: '',
			address: '',
			preferredTime: '',
			notes: '',
			students: [emptyStudent()],
			payByCard: 'later',
			website: '',
		},
		validate: {
			parentFirstName: required('First name'),
			parentLastName: required('Last name'),
			email: (value) =>
				/^\S+@\S+\.\S+$/.test(value.trim()) ? null : 'Enter a valid email',
			phone: (value) =>
				value.replace(/\D/g, '').length >= 10
					? null
					: 'Enter a 10-digit phone number',
			address: required('Address'),
			preferredTime: (value) =>
				program?.classTimes.length && !value ? 'Choose a class time' : null,
			students: {
				firstName: required('First name'),
				lastName: required('Last name'),
				gender: (value) => (value ? null : 'Select boy or girl'),
				dateOfBirth: (value) => (value ? null : 'Date of birth is required'),
			},
		},
	});

	if (loadError) {
		return (
			<Alert color="red" icon={<IconAlertCircle size={16} />}>
				{loadError}
			</Alert>
		);
	}

	if (!program) return <Loader />;

	const kids = form.values.students.length;
	const quote = getRegistrationQuote({
		monthlyFees: program.monthlyFees,
		registrationFee: program.registrationFee,
		kids,
	});
	const payByCard = form.values.payByCard === 'card';

	const handleSubmit = async (values: FormValue) => {
		setSubmitError('');
		setIsSubmitting(true);

		try {
			const response = await fetch('/api/public/registrations', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					programSlug: slug,
					parentFirstName: values.parentFirstName,
					parentLastName: values.parentLastName,
					email: values.email,
					phone: values.phone,
					emergencyPhone: values.emergencyPhone || null,
					address: values.address,
					preferredTime: values.preferredTime || null,
					notes: values.notes || null,
					payByCard: values.payByCard === 'card',
					website: values.website,
					students: values.students.map((student) => ({
						firstName: student.firstName,
						lastName: student.lastName,
						gender: student.gender,
						dateOfBirth: dayjs(student.dateOfBirth).format('YYYY-MM-DD'),
						notes: student.notes || null,
					})),
				}),
			});

			const result = await response.json();

			if (!response.ok) {
				throw new Error(result.error || 'Unable to submit registration');
			}

			if (result.data?.checkoutUrl) {
				window.location.href = result.data.checkoutUrl;
				return;
			}

			router.push(`/register/${slug}/thanks`);
		} catch (error: any) {
			setSubmitError(error.message);
			setIsSubmitting(false);
		}
	};

	return (
		<form onSubmit={form.onSubmit(handleSubmit)}>
			<title>{`${program.name} Registration | Nasrullah Academy`}</title>

			<Stack gap="lg">
				<Stack gap={4}>
					<Title order={2}>{program.name} Registration</Title>
					<Text c="dimmed">Masjid Nasrullah · Nasrullah Academy</Text>
				</Stack>

				{(program.publicInfo || program.monthlyFees.length > 0) && (
					<Card withBorder padding="lg">
						{program.publicInfo && (
							<Text size="sm" style={{ whiteSpace: 'pre-wrap' }}>
								{program.publicInfo}
							</Text>
						)}

						{program.monthlyFees.length > 0 && (
							<>
								<Divider my="sm" />
								<Text size="sm" fw={600} mb={4}>
									Monthly tuition
								</Text>
								<Group gap="xs">
									{program.monthlyFees.map((fee, index) => (
										<Badge key={index} variant="light" size="lg">
											{index + 1} {index === 0 ? 'child' : 'children'}:{' '}
											{formatMoney(fee)}
										</Badge>
									))}
								</Group>
								{program.registrationFee > 0 && (
									<Text size="sm" mt="xs">
										Registration fee: {formatMoney(program.registrationFee)} per
										child
									</Text>
								)}
							</>
						)}
					</Card>
				)}

				<Card withBorder padding="lg">
					<Text fw={700} mb="sm">
						Parent / Guardian
					</Text>
					<Grid>
						<Grid.Col span={{ base: 12, sm: 6 }}>
							<TextInput
								label="First name"
								withAsterisk
								{...form.getInputProps('parentFirstName')}
							/>
						</Grid.Col>
						<Grid.Col span={{ base: 12, sm: 6 }}>
							<TextInput
								label="Last name"
								withAsterisk
								{...form.getInputProps('parentLastName')}
							/>
						</Grid.Col>
						<Grid.Col span={{ base: 12, sm: 6 }}>
							<TextInput
								label="Email"
								type="email"
								withAsterisk
								{...form.getInputProps('email')}
							/>
						</Grid.Col>
						<Grid.Col span={{ base: 12, sm: 6 }}>
							<TextInput
								label="Phone"
								type="tel"
								placeholder="404-555-1234"
								withAsterisk
								{...form.getInputProps('phone')}
							/>
						</Grid.Col>
						<Grid.Col span={{ base: 12, sm: 6 }}>
							<TextInput
								label="Emergency phone"
								type="tel"
								description="Another parent or relative"
								{...form.getInputProps('emergencyPhone')}
							/>
						</Grid.Col>
						<Grid.Col span={{ base: 12, sm: 6 }}>
							<TextInput
								label="Address"
								withAsterisk
								{...form.getInputProps('address')}
							/>
						</Grid.Col>
					</Grid>

					{/* Honeypot: hidden from people, filled in by spam bots */}
					<Box
						style={{ position: 'absolute', left: '-10000px' }}
						aria-hidden="true"
					>
						<input
							tabIndex={-1}
							autoComplete="off"
							{...form.getInputProps('website')}
						/>
					</Box>
				</Card>

				<Card withBorder padding="lg">
					<Group justify="space-between" mb="sm">
						<Text fw={700}>Students</Text>
						<Badge variant="light">
							{kids} {kids === 1 ? 'child' : 'children'}
						</Badge>
					</Group>

					<Stack>
						{form.values.students.map((_, index) => (
							<Card key={index} withBorder padding="md" bg="gray.0">
								<Group justify="space-between" mb="xs">
									<Text size="sm" fw={600}>
										Student {index + 1}
									</Text>
									{kids > 1 && (
										<ActionIcon
											color="red"
											variant="subtle"
											aria-label="Remove student"
											onClick={() => form.removeListItem('students', index)}
										>
											<IconTrash size={16} />
										</ActionIcon>
									)}
								</Group>
								<Grid>
									<Grid.Col span={{ base: 12, sm: 6 }}>
										<TextInput
											label="First name"
											withAsterisk
											{...form.getInputProps(`students.${index}.firstName`)}
										/>
									</Grid.Col>
									<Grid.Col span={{ base: 12, sm: 6 }}>
										<TextInput
											label="Last name"
											withAsterisk
											{...form.getInputProps(`students.${index}.lastName`)}
										/>
									</Grid.Col>
									<Grid.Col span={{ base: 12, sm: 6 }}>
										<Text size="sm" fw={500} mb={4}>
											Boy or girl{' '}
											<Text span c="red">
												*
											</Text>
										</Text>
										<SegmentedControl
											fullWidth
											data={[
												{ value: 'BOY', label: 'Boy' },
												{ value: 'GIRL', label: 'Girl' },
											]}
											value={form.values.students[index].gender}
											onChange={(value) =>
												form.setFieldValue(
													`students.${index}.gender`,
													value as 'BOY' | 'GIRL',
												)
											}
										/>
										{form.errors[`students.${index}.gender`] && (
											<Text size="xs" c="red" mt={4}>
												{form.errors[`students.${index}.gender`]}
											</Text>
										)}
									</Grid.Col>
									<Grid.Col span={{ base: 12, sm: 6 }}>
										<DateInput
											label="Date of birth"
											placeholder="MM/DD/YYYY"
											valueFormat="MM/DD/YYYY"
											maxDate={new Date()}
											withAsterisk
											{...form.getInputProps(`students.${index}.dateOfBirth`)}
										/>
									</Grid.Col>
									<Grid.Col span={12}>
										<TextInput
											label="Notes"
											placeholder="Allergies, medical needs, Quran level so far…"
											{...form.getInputProps(`students.${index}.notes`)}
										/>
									</Grid.Col>
								</Grid>
							</Card>
						))}

						{kids < 10 && (
							<Button
								variant="light"
								leftSection={<IconPlus size={16} />}
								onClick={() =>
									form.insertListItem(
										'students',
										emptyStudent(form.values.parentLastName),
									)
								}
							>
								Add another student
							</Button>
						)}
					</Stack>
				</Card>

				{program.classTimes.length > 0 && (
					<Card withBorder padding="lg">
						<Radio.Group
							label="Preferred class time"
							withAsterisk
							{...form.getInputProps('preferredTime')}
						>
							<Stack mt="xs" gap="xs">
								{program.classTimes.map((time) => (
									<Radio key={time} value={time} label={time} />
								))}
							</Stack>
						</Radio.Group>
					</Card>
				)}

				<Card withBorder padding="lg">
					<Textarea
						label="Anything else we should know?"
						autosize
						minRows={2}
						{...form.getInputProps('notes')}
					/>
				</Card>

				<Card withBorder padding="lg">
					<Text fw={700} mb="sm">
						Payment
					</Text>

					<Stack gap={4} mb="md">
						<Group justify="space-between">
							<Text size="sm">
								Registration fee ({kids} × {formatMoney(program.registrationFee)})
							</Text>
							<Text size="sm">{formatMoney(quote.registration)}</Text>
						</Group>
						<Group justify="space-between">
							<Text size="sm">
								First month tuition ({kids} {kids === 1 ? 'child' : 'children'})
							</Text>
							<Text size="sm">{formatMoney(quote.monthly)}</Text>
						</Group>
						<Divider />
						<Group justify="space-between">
							<Text fw={700}>Due now</Text>
							<Text fw={700}>
								{formatMoney(
									payByCard ? quote.card.firstPayment : quote.firstPayment,
								)}
							</Text>
						</Group>
						<Text size="xs" c="dimmed">
							Then{' '}
							{formatMoney(payByCard ? quote.card.monthly : quote.monthly)} per
							month.
							{payByCard && ' Card payments include the processing fee (2.2% + $0.30).'}
						</Text>
					</Stack>

					<Radio.Group {...form.getInputProps('payByCard')}>
						<Stack gap="sm">
							<Radio
								value="card"
								disabled={!program.cardEnabled}
								label={
									<Group gap={6}>
										<IconCreditCard size={16} />
										<span>Pay now by card</span>
										{!program.cardEnabled && (
											<Badge size="xs" color="gray">
												Coming soon
											</Badge>
										)}
									</Group>
								}
								description={
									program.cardEnabled
										? 'Secure checkout by Stripe. Tuition is then charged automatically each month.'
										: 'Online card payment will be available soon.'
								}
							/>
							<Radio
								value="later"
								label="Pay later"
								description="The Academy office will contact you about payment (Zelle, Cash, Check, Keela)."
							/>
						</Stack>
					</Radio.Group>
				</Card>

				{submitError && (
					<Alert color="red" icon={<IconAlertCircle size={16} />}>
						{submitError}
					</Alert>
				)}

				<Button type="submit" size="md" loading={isSubmitting}>
					{payByCard ? 'Continue to secure payment' : 'Submit registration'}
				</Button>
			</Stack>
		</form>
	);
}
