import { useMemo, useState } from 'react';

import {
	Alert,
	Button,
	Grid,
	NumberInput,
	Select,
	Stack,
	Textarea,
	TextInput,
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';

import { IconAlertCircle } from '@tabler/icons-react';
import dayjs from 'dayjs';
import { zod4Resolver } from 'mantine-form-zod-resolver';

import {
	CreateInvoicePayload,
	CreateInvoiceSchema,
	UpdateInvoicePayload,
	UpdateInvoiceSchema,
} from '@app/api/invoices/types';

import { ModalFooter } from '@components/ModalFooter';

import {
	MONTH_OPTIONS,
	PAY_METHOD_OPTIONS,
	PAYMENT_STATUS_OPTIONS,
} from '@configs/enums';

import { useGetPagingFamilies } from '@hooks/react-query/families/useGetPagingFamilies';
import { useCreateInvoice } from '@hooks/react-query/invoices/useCreateInvoice';
import { InvoiceRow } from '@hooks/react-query/invoices/useGetPagingInvoices';
import { useUpdateInvoice } from '@hooks/react-query/invoices/useUpdateInvoice';
import { useGetPagingPrograms } from '@hooks/react-query/programs/useGetPagingPrograms';

import { formatDecimal } from '@utils/number';

type PaymentFormModalProps = {
	invoice?: InvoiceRow;
	defaultYear?: number;
	defaultMonth?: number;
};

type FormValue = {
	familyId: string;
	programId: string;
	year: number;
	month: number;
	studentCount: number;
	registrationFee: number;
	tuitionFee: number;
	bookFee: number;
	paidRegistrationFee: number;
	paidTuitionFee: number;
	paidBookFee: number;
	extraPaid: number;
	payMethod:
		| 'KEELA'
		| 'ZELLE'
		| 'CASH'
		| 'CASHAPP'
		| 'SQUARE'
		| 'CHECK'
		| 'FREE'
		| 'OTHER'
		| 'NA';
	paymentStatus: 'PAID' | 'PARTIAL' | 'UNPAID' | 'NA';
	paidAt: Date | null;
	notes: string;
};

const getSuggestedStatus = (
	totalDue: number,
	totalPaid: number,
): 'PAID' | 'PARTIAL' | 'UNPAID' => {
	if (totalPaid === 0) {
		return 'UNPAID';
	}
	if (totalPaid > 0 && totalPaid < totalDue) {
		return 'PARTIAL';
	}
	return 'PAID';
};

export const PaymentFormModal = ({
	invoice,
	defaultYear,
	defaultMonth,
}: PaymentFormModalProps) => {
	const isEdit = Boolean(invoice?.id);
	const [validationError, setValidationError] = useState<string | null>(null);
	const [isPaymentStatusOverridden, setIsPaymentStatusOverridden] =
		useState(false);

	const { data: families } = useGetPagingFamilies({ page: 1, limit: 500 });
	const { data: programs } = useGetPagingPrograms({ page: 1, limit: 100 });

	const {
		mutateAsync: createInvoice,
		isPending: isCreating,
		error: createError,
	} = useCreateInvoice();
	const {
		mutateAsync: updateInvoice,
		isPending: isUpdating,
		error: updateError,
	} = useUpdateInvoice();

	const isPending = isCreating || isUpdating;
	const submitError = (createError || updateError)?.message;

	const form = useForm<FormValue>({
		initialValues: {
			familyId: invoice?.familyId || '',
			programId: invoice?.programId || '',
			year: invoice?.year || defaultYear || new Date().getFullYear(),
			month: invoice?.month || defaultMonth || new Date().getMonth() + 1,
			studentCount: invoice?.studentCount || 0,
			registrationFee: invoice?.registrationFee || 0,
			tuitionFee: invoice?.tuitionFee || 0,
			bookFee: invoice?.bookFee || 0,
			paidRegistrationFee: invoice?.paidRegistrationFee || 0,
			paidTuitionFee: invoice?.paidTuitionFee || 0,
			paidBookFee: invoice?.paidBookFee || 0,
			extraPaid: invoice?.extraPaid || 0,
			payMethod: invoice?.payMethod || 'NA',
			paymentStatus: invoice?.paymentStatus || 'UNPAID',
			paidAt: invoice?.paidAt ? new Date(invoice.paidAt) : null,
			notes: invoice?.notes || '',
		},
		validate: zod4Resolver(isEdit ? UpdateInvoiceSchema : CreateInvoiceSchema),
	});

	const totalDue = useMemo(
		() =>
			form.values.registrationFee +
			form.values.tuitionFee +
			form.values.bookFee,
		[form.values.bookFee, form.values.registrationFee, form.values.tuitionFee],
	);
	const totalPaid = useMemo(
		() =>
			form.values.paidRegistrationFee +
			form.values.paidTuitionFee +
			form.values.paidBookFee +
			form.values.extraPaid,
		[
			form.values.extraPaid,
			form.values.paidBookFee,
			form.values.paidRegistrationFee,
			form.values.paidTuitionFee,
		],
	);
	const balance = totalDue - totalPaid;

	const syncPaymentStatusIfNeeded = () => {
		if (isPaymentStatusOverridden) {
			return;
		}

		form.setFieldValue(
			'paymentStatus',
			getSuggestedStatus(totalDue, totalPaid),
		);
	};

	const handleAmountChange = (field: keyof FormValue, value: number) => {
		form.setFieldValue(field, value as never);
		syncPaymentStatusIfNeeded();
	};

	const handleSubmit = async (values: FormValue) => {
		setValidationError(null);

		if (isEdit && invoice) {
			const payload: UpdateInvoicePayload = {
				year: values.year,
				month: values.month,
				studentCount: values.studentCount,
				registrationFee: values.registrationFee,
				tuitionFee: values.tuitionFee,
				bookFee: values.bookFee,
				paidRegistrationFee: values.paidRegistrationFee,
				paidTuitionFee: values.paidTuitionFee,
				paidBookFee: values.paidBookFee,
				extraPaid: values.extraPaid,
				payMethod: values.payMethod,
				paymentStatus: values.paymentStatus,
				paidAt: values.paidAt ? dayjs(values.paidAt).toISOString() : null,
				notes: values.notes || null,
			};

			await updateInvoice({ id: invoice.id, data: payload });
		} else {
			const payload: CreateInvoicePayload = {
				familyId: values.familyId,
				programId: values.programId,
				year: values.year,
				month: values.month,
				studentCount: values.studentCount,
				registrationFee: values.registrationFee,
				tuitionFee: values.tuitionFee,
				bookFee: values.bookFee,
				paidRegistrationFee: values.paidRegistrationFee,
				paidTuitionFee: values.paidTuitionFee,
				paidBookFee: values.paidBookFee,
				extraPaid: values.extraPaid,
				payMethod: values.payMethod,
				paymentStatus: values.paymentStatus,
				paidAt: values.paidAt ? dayjs(values.paidAt).toISOString() : null,
				notes: values.notes || null,
			};

			await createInvoice(payload);
		}

		notifications.show({
			title: isEdit ? 'Payment updated' : 'Payment created',
			message: isEdit
				? 'Monthly payment updated successfully'
				: 'Monthly payment created successfully',
			color: 'green',
		});

		modals.closeAll();
	};

	return (
		<Stack>
			{(validationError || submitError) && (
				<Alert color="red" icon={<IconAlertCircle size={16} />}>
					{validationError || submitError}
				</Alert>
			)}

			<form
				onSubmit={form.onSubmit(handleSubmit, (errors) => {
					const first = Object.values(errors).find(Boolean);
					setValidationError(
						typeof first === 'string'
							? first
							: 'Please check the highlighted fields',
					);
				})}
			>
				<Stack>
					<Grid>
						{!isEdit && (
							<Grid.Col span={{ base: 12, md: 4 }}>
								<Select
									label="Family"
									placeholder="Select family"
									withAsterisk
									searchable
									data={families?.data.map((family) => ({
										value: family.id,
										label: family.name,
									}))}
									{...form.getInputProps('familyId')}
								/>
							</Grid.Col>
						)}
						{!isEdit && (
							<Grid.Col span={{ base: 12, md: 4 }}>
								<Select
									label="Program"
									placeholder="Select program"
									withAsterisk
									searchable
									data={programs?.data.map((program) => ({
										value: program.id,
										label: program.name,
									}))}
									{...form.getInputProps('programId')}
								/>
							</Grid.Col>
						)}
						<Grid.Col span={{ base: 12, md: 4 }}>
							<NumberInput
								label="Year"
								placeholder="2026"
								withAsterisk
								min={2000}
								max={2100}
								allowDecimal={false}
								{...form.getInputProps('year')}
							/>
						</Grid.Col>
						<Grid.Col span={{ base: 12, md: 4 }}>
							<Select
								label="Month"
								placeholder="Select month"
								withAsterisk
								data={MONTH_OPTIONS}
								value={String(form.values.month)}
								onChange={(value) =>
									form.setFieldValue('month', Number(value || 1))
								}
							/>
						</Grid.Col>
						<Grid.Col span={{ base: 12, md: 4 }}>
							<NumberInput
								label="#Kids"
								placeholder="0"
								min={0}
								allowDecimal={false}
								{...form.getInputProps('studentCount')}
							/>
						</Grid.Col>
					</Grid>

					<Grid>
						<Grid.Col span={{ base: 12, md: 4 }}>
							<NumberInput
								label="Registration Fee"
								placeholder="0.00"
								prefix="$"
								decimalScale={2}
								fixedDecimalScale
								min={0}
								value={form.values.registrationFee}
								onChange={(value) =>
									handleAmountChange('registrationFee', Number(value || 0))
								}
							/>
						</Grid.Col>
						<Grid.Col span={{ base: 12, md: 4 }}>
							<NumberInput
								label="Tuition Fee"
								placeholder="0.00"
								prefix="$"
								decimalScale={2}
								fixedDecimalScale
								min={0}
								value={form.values.tuitionFee}
								onChange={(value) =>
									handleAmountChange('tuitionFee', Number(value || 0))
								}
							/>
						</Grid.Col>
						<Grid.Col span={{ base: 12, md: 4 }}>
							<NumberInput
								label="Book Fee"
								placeholder="0.00"
								prefix="$"
								decimalScale={2}
								fixedDecimalScale
								min={0}
								value={form.values.bookFee}
								onChange={(value) =>
									handleAmountChange('bookFee', Number(value || 0))
								}
							/>
						</Grid.Col>
						<Grid.Col span={{ base: 12, md: 4 }}>
							<NumberInput
								label="Paid Registration"
								placeholder="0.00"
								prefix="$"
								decimalScale={2}
								fixedDecimalScale
								min={0}
								value={form.values.paidRegistrationFee}
								onChange={(value) =>
									handleAmountChange('paidRegistrationFee', Number(value || 0))
								}
							/>
						</Grid.Col>
						<Grid.Col span={{ base: 12, md: 4 }}>
							<NumberInput
								label="Paid Tuition"
								placeholder="0.00"
								prefix="$"
								decimalScale={2}
								fixedDecimalScale
								min={0}
								value={form.values.paidTuitionFee}
								onChange={(value) =>
									handleAmountChange('paidTuitionFee', Number(value || 0))
								}
							/>
						</Grid.Col>
						<Grid.Col span={{ base: 12, md: 4 }}>
							<NumberInput
								label="Paid Book"
								placeholder="0.00"
								prefix="$"
								decimalScale={2}
								fixedDecimalScale
								min={0}
								value={form.values.paidBookFee}
								onChange={(value) =>
									handleAmountChange('paidBookFee', Number(value || 0))
								}
							/>
						</Grid.Col>
						<Grid.Col span={{ base: 12, md: 4 }}>
							<NumberInput
								label="Extra Paid"
								placeholder="0.00"
								prefix="$"
								decimalScale={2}
								fixedDecimalScale
								min={0}
								value={form.values.extraPaid}
								onChange={(value) =>
									handleAmountChange('extraPaid', Number(value || 0))
								}
							/>
						</Grid.Col>
						<Grid.Col span={{ base: 12, md: 4 }}>
							<TextInput
								label="Total Due"
								placeholder="0.00"
								value={formatDecimal(totalDue)}
								readOnly
								disabled
								leftSection="$"
							/>
						</Grid.Col>
						<Grid.Col span={{ base: 12, md: 4 }}>
							<TextInput
								label="Total Paid"
								placeholder="0.00"
								value={formatDecimal(totalPaid)}
								readOnly
								disabled
								leftSection="$"
							/>
						</Grid.Col>
						<Grid.Col span={{ base: 12, md: 4 }}>
							<TextInput
								label="Balance"
								placeholder="0.00"
								value={formatDecimal(balance)}
								readOnly
								leftSection="$"
							/>
						</Grid.Col>
					</Grid>

					<Grid>
						<Grid.Col span={{ base: 12, md: 4 }}>
							<Select
								label="Pay Method"
								placeholder="Select pay method"
								data={PAY_METHOD_OPTIONS}
								{...form.getInputProps('payMethod')}
							/>
						</Grid.Col>
						<Grid.Col span={{ base: 12, md: 4 }}>
							<Select
								label="Payment Status"
								placeholder="Select payment status"
								data={PAYMENT_STATUS_OPTIONS}
								value={form.values.paymentStatus}
								onChange={(value) => {
									setIsPaymentStatusOverridden(true);
									form.setFieldValue(
										'paymentStatus',
										(value || 'UNPAID') as FormValue['paymentStatus'],
									);
								}}
							/>
						</Grid.Col>
						<Grid.Col span={{ base: 12, md: 4 }}>
							<DateInput
								label="Paid At"
								placeholder="Select payment date"
								value={form.values.paidAt}
								error={form.errors.paidAt}
								onChange={(value) =>
									form.setFieldValue(
										'paidAt',
										value ? new Date(String(value)) : null,
									)
								}
							/>
						</Grid.Col>
					</Grid>

					<Textarea
						label="Notes"
						placeholder="Optional note"
						autosize
						minRows={3}
						{...form.getInputProps('notes')}
					/>

					<ModalFooter>
						<Button variant="default" onClick={() => modals.closeAll()}>
							Cancel
						</Button>
						<Button type="submit" loading={isPending}>
							{isEdit ? 'Update payment' : 'Create payment'}
						</Button>
					</ModalFooter>
				</Stack>
			</form>
		</Stack>
	);
};
