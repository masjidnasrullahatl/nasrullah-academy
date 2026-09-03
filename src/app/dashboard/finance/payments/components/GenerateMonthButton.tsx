import { useState } from 'react';

import {
	Button,
	Checkbox,
	Group,
	Select,
	Stack,
	Text,
	Tooltip,
} from '@mantine/core';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';

import { IconCategory, IconSparkles } from '@tabler/icons-react';

import { ModalFooter } from '@components/ModalFooter';

import { MONTH_OPTIONS } from '@configs/enums';

import { useGenerateInvoices } from '@hooks/react-query/invoices/useGenerateInvoices';
import { useGetPagingPrograms } from '@hooks/react-query/programs/useGetPagingPrograms';

type GenerateMonthButtonProps = {
	year?: number;
	month?: number;
};

export const GenerateMonthButton = ({
	year,
	month,
}: GenerateMonthButtonProps) => {
	const [copyFromPreviousMonth, setCopyFromPreviousMonth] = useState(false);
	const [programId, setProgramId] = useState<string | null>(null);
	const { data: programs } = useGetPagingPrograms({ page: 1, limit: 100 });
	const { mutateAsync: generateInvoices, isPending } = useGenerateInvoices();

	const monthLabel = month
		? MONTH_OPTIONS.find((item) => Number(item.value) === month)?.label || month
		: '-';

	const handleGenerate = () => {
		if (!year || !month || !programId) return;

		const targetYear = year;
		const targetMonth = month;
		const targetProgram =
			programs?.data.find((item) => item.id === programId)?.name || '-';

		modals.open({
			title: 'Generate month invoices',
			size: 'md',
			children: (
				<Stack>
					<Text size="sm">
						Target: <b>{monthLabel}</b> <b>{targetYear}</b>
					</Text>
					<Text size="sm">
						Program: <b>{targetProgram}</b>
					</Text>
					<Text size="sm" c="dimmed">
						Existing invoice rows are not overwritten.
					</Text>
					<Group>
						<Checkbox
							label="Copy fee amounts from previous month"
							checked={copyFromPreviousMonth}
							onChange={(event) =>
								setCopyFromPreviousMonth(event.currentTarget.checked)
							}
						/>
					</Group>

					<ModalFooter>
						<Button variant="default" onClick={() => modals.closeAll()}>
							Cancel
						</Button>
						<Button
							loading={isPending}
							onClick={async () => {
								const result = await generateInvoices({
									year: targetYear,
									month: targetMonth,
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
		<Group>
			<Select
				placeholder="Select program"
				leftSection={<IconCategory size={16} />}
				clearable
				searchable
				w={220}
				data={programs?.data.map((program) => ({
					value: program.id,
					label: program.name,
				}))}
				value={programId}
				onChange={setProgramId}
			/>

			<Tooltip
				label={
					year && month && programId
						? 'Generate invoices for selected month'
						: 'Select year, month, and program first'
				}
			>
				<Button
					onClick={handleGenerate}
					leftSection={<IconSparkles size={16} />}
					loading={isPending}
					disabled={!year || !month || !programId}
				>
					Generate month
				</Button>
			</Tooltip>
		</Group>
	);
};
