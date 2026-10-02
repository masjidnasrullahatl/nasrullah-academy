import { useState } from 'react';

import {
	Button,
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
import { useGetPagingInvoices } from '@hooks/react-query/invoices/useGetPagingInvoices';
import { useGetPagingPrograms } from '@hooks/react-query/programs/useGetPagingPrograms';

type GenerateMonthButtonProps = {
	year?: number;
	month?: number;
};

export const GenerateMonthButton = ({
	year,
	month,
}: GenerateMonthButtonProps) => {
	const [programId, setProgramId] = useState<string | null>(null);
	const { data: programs } = useGetPagingPrograms({ page: 1, limit: 100 });
	const { mutateAsync: generateInvoices, isPending } = useGenerateInvoices();

	const { data: existingInvoices } = useGetPagingInvoices({
		page: 1,
		limit: 1,
		year,
		month,
		programId: programId || undefined,
	});

	const isGenerated = Boolean(year && month && existingInvoices?.total);

	const monthLabel = month
		? MONTH_OPTIONS.find((item) => Number(item.value) === month)?.label || month
		: '-';

	const handleGenerate = () => {
		if (!year || !month || isGenerated) return;

		const targetYear = year;
		const targetMonth = month;
		const targetProgram = programId
			? programs?.data.find((item) => item.id === programId)?.name || '-'
			: 'All programs';

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
						Creates one unpaid row per family, prefilled with the kids and
						monthly fee set on the family. Existing rows are not overwritten.
					</Text>

					<ModalFooter>
						<Button variant="default" onClick={() => modals.closeAll()}>
							Cancel
						</Button>
						<Button
							loading={isPending}
							onClick={async () => {
								try {
									const result = await generateInvoices({
										year: targetYear,
										month: targetMonth,
										programId,
									});

									notifications.show({
										title: 'Invoices generated',
										message: `Created ${result.created} invoices`,
										color: 'green',
									});
								} catch (error: any) {
									notifications.show({
										title: 'Not generated',
										message: error.message,
										color: 'red',
									});
								}

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
				placeholder="All programs"
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
					!year || !month
						? 'Select year and month first'
						: isGenerated
							? `${monthLabel} ${year} has already been generated`
							: 'Generate invoices for selected month'
				}
			>
				<Button
					onClick={handleGenerate}
					leftSection={<IconSparkles size={16} />}
					loading={isPending}
					disabled={!year || !month || isGenerated}
				>
					{isGenerated ? 'Month generated' : 'Generate month'}
				</Button>
			</Tooltip>
		</Group>
	);
};
