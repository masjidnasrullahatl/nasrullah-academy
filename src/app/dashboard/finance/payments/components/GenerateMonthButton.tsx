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

	// Card payments add rows as they arrive, so a started month still needs
	// its unpaid families added
	const hasRows = Boolean(year && month && existingInvoices?.total);

	const monthLabel = month
		? MONTH_OPTIONS.find((item) => Number(item.value) === month)?.label || month
		: '-';

	const handleGenerate = () => {
		if (!year || !month) return;

		const targetYear = year;
		const targetMonth = month;
		const targetProgram = programId
			? programs?.data.find((item) => item.id === programId)?.name || '-'
			: 'All programs';

		modals.open({
			title: hasRows ? 'Add missing families' : 'Generate month invoices',
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
						Creates an unpaid row for every family that does not have one yet,
						prefilled with the kids and monthly fee set on the family. Rows
						already there, such as card payments, are not changed.
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
										title: result.created ? 'Rows added' : 'Nothing to add',
										message: result.created
											? `Added ${result.created} unpaid ${result.created === 1 ? 'row' : 'rows'}`
											: 'Every family already has a row this month',
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
							{hasRows ? 'Add missing families' : 'Generate'}
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
						: hasRows
							? `Adds an unpaid row for each family without one in ${monthLabel} ${year}`
							: 'Generate invoices for selected month'
				}
			>
				<Button
					onClick={handleGenerate}
					leftSection={<IconSparkles size={16} />}
					loading={isPending}
					disabled={!year || !month}
				>
					{hasRows ? 'Add missing families' : 'Generate month'}
				</Button>
			</Tooltip>
		</Group>
	);
};
