import { useMemo } from 'react';

import { Alert, Button, Group, NumberInput, Select, Stack, Textarea, TextInput } from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';

import { IconAlertCircle } from '@tabler/icons-react';
import dayjs from 'dayjs';
import { zod4Resolver } from 'mantine-form-zod-resolver';

import {
	CreatePayrollPeriodPayload,
	CreatePayrollPeriodSchema,
	UpdatePayrollPeriodPayload,
	UpdatePayrollPeriodSchema,
} from '@app/api/payroll-periods/types';

import { MONTH_OPTIONS, PAYROLL_STATUS_OPTIONS } from '@configs/enums';

import { useCreatePayrollPeriod } from '@hooks/react-query/payroll/useCreatePayrollPeriod';
import { PayrollPeriodRow } from '@hooks/react-query/payroll/useGetPagingPayrollPeriods';
import { useUpdatePayrollPeriod } from '@hooks/react-query/payroll/useUpdatePayrollPeriod';

type PayrollPeriodFormModalProps = {
	period?: PayrollPeriodRow;
};

type FormValue = {
	label: string;
	year: number;
	month: number;
	startDate: Date | null;
	endDate: Date | null;
	status: 'DRAFT' | 'PAID';
	notes: string;
};

export const PayrollPeriodFormModal = ({ period }: PayrollPeriodFormModalProps) => {
	const isEdit = Boolean(period?.id);

	const { mutateAsync: createPeriod, isPending: isCreating, error: createError } =
		useCreatePayrollPeriod();
	const { mutateAsync: updatePeriod, isPending: isUpdating, error: updateError } =
		useUpdatePayrollPeriod();

	const isPending = isCreating || isUpdating;
	const submitError = (createError || updateError)?.message;

	const form = useForm<FormValue>({
		initialValues: {
			label: period?.label || '',
			year: period?.year || new Date().getFullYear(),
			month: period?.month || new Date().getMonth() + 1,
			startDate: period?.startDate ? new Date(period.startDate) : null,
			endDate: period?.endDate ? new Date(period.endDate) : null,
			status: period?.status || 'DRAFT',
			notes: period?.notes || '',
		},
		validate: zod4Resolver(isEdit ? UpdatePayrollPeriodSchema : CreatePayrollPeriodSchema),
	});

	const monthLabel = useMemo(
		() => MONTH_OPTIONS.find((month) => Number(month.value) === form.values.month)?.label,
		[form.values.month],
	);

	const handlePrefillFromMonth = (year: number, month: number) => {
		const firstDate = dayjs(new Date(year, month - 1, 1)).toDate();
		const lastDate = dayjs(new Date(year, month - 1, 1)).endOf('month').toDate();
		const selectedMonthLabel =
			MONTH_OPTIONS.find((item) => Number(item.value) === month)?.label || `Month ${month}`;

		form.setFieldValue('label', `Payroll ${selectedMonthLabel} ${year}`);
		form.setFieldValue('startDate', firstDate);
		form.setFieldValue('endDate', lastDate);
	};

	const handleSubmit = async (values: FormValue) => {
		if (!values.startDate || !values.endDate) {
			return;
		}

		if (isEdit && period) {
			const payload: UpdatePayrollPeriodPayload = {
				label: values.label,
				year: values.year,
				month: values.month,
				startDate: values.startDate.toISOString(),
				endDate: values.endDate.toISOString(),
				status: values.status,
				notes: values.notes || null,
			};
			await updatePeriod({ id: period.id, data: payload });
		} else {
			const payload: CreatePayrollPeriodPayload = {
				label: values.label,
				year: values.year,
				month: values.month,
				startDate: values.startDate.toISOString(),
				endDate: values.endDate.toISOString(),
				status: values.status,
				notes: values.notes || null,
			};
			await createPeriod(payload);
		}

		notifications.show({
			title: isEdit ? 'Payroll period updated' : 'Payroll period created',
			message: isEdit
				? 'Payroll period updated successfully'
				: 'Payroll period created successfully',
			color: 'green',
		});

		modals.closeAll();
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
					<TextInput label="Label" withAsterisk {...form.getInputProps('label')} />
					<Group grow>
						<NumberInput
							label="Year"
							withAsterisk
							allowDecimal={false}
							min={2000}
							max={2100}
							value={form.values.year}
							onChange={(value) => {
								const yearValue = Number(value || new Date().getFullYear());
								form.setFieldValue('year', yearValue);
								handlePrefillFromMonth(yearValue, form.values.month);
							}}
						/>
						<Select
							label="Month"
							withAsterisk
							data={MONTH_OPTIONS}
							value={String(form.values.month)}
							onChange={(value) => {
								const monthValue = Number(value || 1);
								form.setFieldValue('month', monthValue);
								handlePrefillFromMonth(form.values.year, monthValue);
							}}
							description={monthLabel ? `Selected: ${monthLabel}` : ''}
						/>
					</Group>
					<Group grow>
						<DateInput
							label="Start Date"
							withAsterisk
							valueFormat="MM/DD/YYYY"
							value={form.values.startDate}
							onChange={(value) =>
								form.setFieldValue('startDate', value ? new Date(value) : null)
							}
						/>
						<DateInput
							label="End Date"
							withAsterisk
							valueFormat="MM/DD/YYYY"
							value={form.values.endDate}
							onChange={(value) =>
								form.setFieldValue('endDate', value ? new Date(value) : null)
							}
						/>
					</Group>
					<Select
						label="Status"
						data={PAYROLL_STATUS_OPTIONS}
						withAsterisk
						{...form.getInputProps('status')}
					/>
					<Textarea label="Notes" minRows={2} {...form.getInputProps('notes')} />
					<Group justify="flex-end">
						<Button variant="default" onClick={() => modals.closeAll()}>
							Cancel
						</Button>
						<Button type="submit" loading={isPending}>
							{isEdit ? 'Update Period' : 'Create Period'}
						</Button>
					</Group>
				</Stack>
			</form>
		</Stack>
	);
};
