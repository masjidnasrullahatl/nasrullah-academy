import { useState } from 'react';

import { Button, Group, MultiSelect, Stack, Text } from '@mantine/core';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';

import { useAddTeachersToPeriod } from '@hooks/react-query/payroll/useAddTeachersToPeriod';
import { PayrollPeriodRow } from '@hooks/react-query/payroll/useGetPagingPayrollPeriods';
import { useGetPagingTeachers } from '@hooks/react-query/teachers/useGetPagingTeachers';

import { formatMoney } from '@utils/money';

type AddTeachersModalProps = {
	period: PayrollPeriodRow;
};

export const AddTeachersModal = ({ period }: AddTeachersModalProps) => {
	const [teacherIds, setTeacherIds] = useState<string[]>([]);

	const { data: teachers } = useGetPagingTeachers({
		page: 1,
		limit: 500,
		status: 'ACTIVE',
	});
	const { mutateAsync: addTeachers, isPending } = useAddTeachersToPeriod();

	const existingTeacherIds = new Set(period.entries.map((entry) => entry.teacherId));
	const options =
		teachers?.data
			.filter((teacher) => !existingTeacherIds.has(teacher.id))
			.map((teacher) => ({
				value: teacher.id,
				label: `${teacher.firstName} ${teacher.lastName} · ${formatMoney(teacher.hourlyRate)}/h`,
			})) || [];

	const handleSubmit = async () => {
		await addTeachers({
			periodId: period.id,
			data: { teacherIds },
		});

		notifications.show({
			title: 'Teachers added',
			message: `${teacherIds.length} teacher(s) added to period`,
			color: 'green',
		});

		modals.closeAll();
	};

	return (
		<Stack>
			{options.length === 0 ? (
				<Text c="dimmed" size="sm">
					No available active teachers to add.
				</Text>
			) : (
				<MultiSelect
					label="Teachers"
					data={options}
					value={teacherIds}
					onChange={setTeacherIds}
					searchable
					clearable
					hidePickedOptions
				/>
			)}
			<Group justify="flex-end">
				<Button variant="default" onClick={() => modals.closeAll()}>
					Cancel
				</Button>
				<Button onClick={handleSubmit} loading={isPending} disabled={teacherIds.length === 0}>
					Add teachers
				</Button>
			</Group>
		</Stack>
	);
};
