import { useState } from 'react';

import { Alert, Button, Checkbox, Group, Stack, Text, Tooltip } from '@mantine/core';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';

import { IconAlertCircle, IconSparkles } from '@tabler/icons-react';

import { ModalFooter } from '@components/ModalFooter';

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
		modals.open({
			title: 'Generate month invoices',
			size: 'md',
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

					<ModalFooter>
						<Button variant="default" onClick={() => modals.closeAll()}>
							Cancel
						</Button>
						<Button
							loading={isPending}
							disabled={!programId}
							onClick={async () => {
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

								modals.closeAll();
							}}
						>
							Generate
						</Button>
					</ModalFooter>
				</Stack>
			),
		});
	};

	return (
		<Tooltip label={!programId ? 'Select a program first' : 'Generate invoices for selected month'}>
			<Button
				onClick={handleGenerate}
				leftSection={<IconSparkles size={16} />}
				disabled={!programId}
				loading={isPending}
			>
				Generate month
			</Button>
		</Tooltip>
	);
};
