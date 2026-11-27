import { useState } from 'react';

import { Button, Select, Stack, Text } from '@mantine/core';
import { MonthPickerInput } from '@mantine/dates';

import { IconPrinter } from '@tabler/icons-react';
import dayjs from 'dayjs';

import { ModalFooter } from '@components/ModalFooter';

import { useScholarshipStatement } from '@hooks/react-query/scholarships/useScholarshipStatement';

const ALL_FAMILIES = 'all';

// Choose a month, donor and family, then open the printable statement in a new tab
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

	const [family, setFamily] = useState<string>(ALL_FAMILIES);

	const donors = data?.donors || [];
	const selectedDonor = donor && donors.includes(donor) ? donor : null;

	// the families this donor covers, so each family can get its own statement
	const { data: donorData, isFetching: isFetchingFamilies } =
		useScholarshipStatement({
			year,
			month: monthNumber,
			donor: selectedDonor || undefined,
		});

	const families = selectedDonor ? donorData?.families || [] : [];
	const selectedFamily = families.some((item) => item.id === family)
		? family
		: ALL_FAMILIES;

	const handleOpen = () => {
		if (!year || !monthNumber || !selectedDonor) return;

		const query = new URLSearchParams({
			year: String(year),
			month: String(monthNumber),
			donor: selectedDonor,
		});

		if (selectedFamily !== ALL_FAMILIES) {
			query.set('familyId', selectedFamily);
		}

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
			<Select
				label="Family"
				description="Choose one family so each donor sees only the students they support"
				placeholder={isFetchingFamilies ? 'Loading...' : undefined}
				data={[
					{ value: ALL_FAMILIES, label: 'All families' },
					...families.map((item) => ({ value: item.id, label: item.name })),
				]}
				value={selectedFamily}
				onChange={(next) => setFamily(next || ALL_FAMILIES)}
				disabled={!selectedDonor}
				allowDeselect={false}
				searchable
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
