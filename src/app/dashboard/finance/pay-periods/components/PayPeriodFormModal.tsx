import { useState } from 'react';

import { Alert, Button, Group, Stack, TextInput } from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';

import { IconAlertCircle } from '@tabler/icons-react';

import { CreatePayPeriodPayload } from '@app/api/pay-periods/types';

import { useCreatePayPeriod } from '@hooks/react-query/pay-periods/useCreatePayPeriod';
import { PayPeriodRow } from '@hooks/react-query/pay-periods/useGetPagingPayPeriods';
import { useUpdatePayPeriod } from '@hooks/react-query/pay-periods/useUpdatePayPeriod';

type FormValues = {
	name: string;
	startDate: Date | null;
	endDate: Date | null;
};

type Props = {
	payPeriod?: PayPeriodRow;
};

export const PayPeriodFormModal = ({ payPeriod }: Props) => {
	const [submitError, setSubmitError] = useState('');

	const isEdit = Boolean(payPeriod);
	const { mutateAsync: createPayPeriod, isPending: isCreating } = useCreatePayPeriod();
	const { mutateAsync: updatePayPeriod, isPending: isUpdating } = useUpdatePayPeriod();

	const form = useForm<FormValues>({
		initialValues: {
			name: payPeriod?.name || '',
			startDate: payPeriod?.startDate ? new Date(payPeriod.startDate) : null,
			endDate: payPeriod?.endDate ? new Date(payPeriod.endDate) : null,
		},
		validate: {
			name: (value) => (value.trim() ? null : 'Name is required'),
			startDate: (value) => (value ? null : 'Start date is required'),
			endDate: (value) => (value ? null : 'End date is required'),
		},
	});

	const isSubmitting = isCreating || isUpdating;

	const handleSubmit = async (values: FormValues) => {
		try {
			setSubmitError('');

			if (!values.startDate || !values.endDate) {
				return;
			}

			if (values.endDate <= values.startDate) {
				setSubmitError('End date must be after start date');
				return;
			}

			const payload: CreatePayPeriodPayload = {
				name: values.name.trim(),
				startDate: values.startDate,
				endDate: values.endDate,
			};

			if (isEdit && payPeriod) {
				await updatePayPeriod({ id: payPeriod.id, data: payload });
			} else {
				await createPayPeriod(payload);
			}

			notifications.show({
				title: isEdit ? 'Pay period updated' : 'Pay period created',
				message: isEdit
					? 'Pay period has been updated successfully'
					: 'Pay period has been created successfully',
				color: 'green',
			});
			modals.closeAll();
		} catch (error) {
			setSubmitError(error instanceof Error ? error.message : 'Unexpected error');
		}
	};

	return (
		<Stack>
			{submitError && (
				<Alert color="red" icon={<IconAlertCircle size={16} />}>
					{submitError}
				</Alert>
			)}

			<form onSubmit={form.onSubmit(handleSubmit)}>
				<Stack>
					<TextInput
						label="Name"
						withAsterisk
						placeholder="Ex: Sep 1 - Sep 15"
						{...form.getInputProps('name')}
					/>
					<DateInput
						label="Start Date"
						withAsterisk
						valueFormat="MM/DD/YYYY"
						{...form.getInputProps('startDate')}
					/>
					<DateInput
						label="End Date"
						withAsterisk
						valueFormat="MM/DD/YYYY"
						{...form.getInputProps('endDate')}
					/>

					<Group justify="flex-end">
						<Button variant="default" onClick={() => modals.closeAll()}>
							Cancel
						</Button>
						<Button type="submit" loading={isSubmitting}>
							{isEdit ? 'Update' : 'Create'}
						</Button>
					</Group>
				</Stack>
			</form>
		</Stack>
	);
};
