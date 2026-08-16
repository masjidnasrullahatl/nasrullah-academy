import { useState } from 'react';

import { Alert, Button, Checkbox, Group, Stack, Text } from '@mantine/core';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';

import { IconAlertCircle } from '@tabler/icons-react';

import { MONTH_OPTIONS } from '@configs/enums';

import { useGenerateInvoices } from '@hooks/react-query/invoices/useGenerateInvoices';

type GenerateMonthButtonProps = {
	year: number;
	month: number;
	programId?: string;
	programLabel?: string;
};

export const GenerateMonthButton = ({
	year,
	month,
	programId,
	programLabel,
}: GenerateMonthButtonProps) => {
	const [copyFromPreviousMonth, setCopyFromPreviousMonth] = useState(false);
	const { mutateAsync: generateInvoices, isPending } = useGenerateInvoices();

	const monthLabel = MONTH_OPTIONS.find((item) => Number(item.value) === month)?.label || month;

	const handleGenerate = () => {
		modals.openConfirmModal({
			title: 'Generate month invoices',
			labels: { confirm: 'Generate', cancel: 'Cancel' },
			confirmProps: { loading: isPending, disabled: !programId },
			onConfirm: async () => {
				if (!programId) {
					return;
				}

				const result = await generateInvoices({
					year,
					month,
					programId,
					copyFromPreviousMonth,
				});

				notifications.show({
					title: 'Invoices generated',
					message: `Created ${result.created} invoices, skipped ${result.skipped} existing`,
					color: 'green',
				});
			},
			children: (
				<Stack>
					{!programId && (
						<Alert color="yellow" icon={<IconAlertCircle size={16} />}>
							Please select a program before generating invoices.
						</Alert>
					)}

					<Text size="sm">
						Target: <b>{monthLabel}</b> <b>{year}</b> · Program:{' '}
						<b>{programLabel || 'Not selected'}</b>
					</Text>
					<Text size="sm" c="dimmed">
						Existing invoice rows are not overwritten.
					</Text>
					<Group>
						<Checkbox
							label="Copy fee amounts from previous month"
							checked={copyFromPreviousMonth}
							onChange={(event) => setCopyFromPreviousMonth(event.currentTarget.checked)}
						/>
					</Group>
				</Stack>
			),
		});
	};

	return (
		<Button onClick={handleGenerate} variant="default" loading={isPending}>
			Generate month
		</Button>
	);
};
