import { useState } from 'react';

import { Button, Select, Stack, Text } from '@mantine/core';
import { MonthPickerInput } from '@mantine/dates';

import { IconPrinter } from '@tabler/icons-react';
import dayjs from 'dayjs';

import { ModalFooter } from '@components/ModalFooter';

import { useScholarshipStatement } from '@hooks/react-query/scholarships/useScholarshipStatement';

// Choose a month and donor, then open the printable statement in a new tab
export const DonorStatementModal = () => {
	const [month, setMonth] = useState<Date | null>(
		dayjs().startOf('month').toDate(),
	);
	const [donor, setDonor] = useState<string | null>(null);

	const year = month ? dayjs(month).year() : undefined;
	const monthNumber = month ? dayjs(month).month() + 1 : undefined;

	const { data, isFetching } = useScholarshipStatement({
		year,
		month: monthNumber,
	});

	const donors = data?.donors || [];
	const selectedDonor = donor && donors.includes(donor) ? donor : null;

	const handleOpen = () => {
		if (!year || !monthNumber || !selectedDonor) return;

		const query = new URLSearchParams({
			year: String(year),
			month: String(monthNumber),
			donor: selectedDonor,
		});

		window.open(`/print/scholarship-statement?${query}`, '_blank');
	};

	return (
		<Stack>
			<Text size="sm">
				A printable statement for the donor, showing the students their gift
				covered that month and each family payment record for the month.
			</Text>
			<MonthPickerInput
				label="Month"
				valueFormat="MMMM YYYY"
				value={month}
				onChange={(next) => setMonth(next ? dayjs(next).toDate() : null)}
				withAsterisk
			/>
			<Select
				label="Donor"
				placeholder={
					isFetching
						? 'Loading...'
						: donors.length
							? 'Choose a donor'
							: 'No scholarships cover this month'
				}
				data={donors}
				value={selectedDonor}
				onChange={setDonor}
				disabled={!donors.length}
				searchable
				withAsterisk
			/>
			<ModalFooter>
				<Button
					leftSection={<IconPrinter size={16} />}
					onClick={handleOpen}
					disabled={!selectedDonor}
				>
					Open statement
				</Button>
			</ModalFooter>
		</Stack>
	);
};
