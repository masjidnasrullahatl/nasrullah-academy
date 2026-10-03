import {
	Badge,
	Button,
	Divider,
	Group,
	Progress,
	SimpleGrid,
	Stack,
	Text,
	Tooltip,
} from '@mantine/core';
import { modals } from '@mantine/modals';

import { IconFileTypePdf, IconPlus } from '@tabler/icons-react';

import { useGetPagingMilestones } from '@hooks/react-query/milestones/useGetPagingMilestones';

import { openPrintWindow } from '@utils/printReport';

import { buildStudentReport } from '../reports';
import { formatCompletedAt, JUZ_COUNT } from '../utils';

import { MilestoneFormModal } from './MilestoneFormModal';

type Props = {
	student: {
		id: string;
		firstName: string;
		lastName: string;
		family?: { name: string } | null;
		programs?: Array<{ name: string }>;
	};
};

export const StudentMilestonesModal = ({ student }: Props) => {
	const studentId = student.id;

	const { data: milestones, isLoading } = useGetPagingMilestones({
		page: 1,
		limit: 500,
		studentId,
	});

	const juz = milestones?.data.filter((item) => item.type === 'JUZ') || [];
	const books = milestones?.data.filter((item) => item.type === 'BOOK') || [];
	const juzByNumber = new Map(juz.map((item) => [item.juzNumber, item]));

	const handleExport = () => {
		openPrintWindow().render(
			`${student.firstName} ${student.lastName} Progress Report`,
			buildStudentReport(student, milestones?.data || []),
		);
	};

	const handleRecord = () => {
		modals.open({
			title: 'Record Milestone',
			size: 'lg',
			children: <MilestoneFormModal defaultStudentId={studentId} />,
		});
	};

	return (
		<Stack>
			<Stack gap={6}>
				<Group justify="space-between">
					<Text fw={700}>Juz memorized</Text>
					<Text size="sm" fw={600}>
						{juz.length} of {JUZ_COUNT}
					</Text>
				</Group>
				<Progress value={(juz.length / JUZ_COUNT) * 100} color="yellow" />
				<SimpleGrid cols={10} spacing={6} mt={4}>
					{Array.from({ length: JUZ_COUNT }, (_, index) => {
						const done = juzByNumber.get(index + 1);

						return (
							<Tooltip
								key={index}
								label={
									done
										? 'Juz ' +
											(index + 1) +
											' on ' +
											formatCompletedAt(done.completedAt)
										: 'Juz ' + (index + 1) + ' not yet'
								}
							>
								<Badge
									variant={done ? 'filled' : 'light'}
									color={done ? 'yellow' : 'gray'}
									fullWidth
								>
									{index + 1}
								</Badge>
							</Tooltip>
						);
					})}
				</SimpleGrid>
			</Stack>

			<Divider />

			<Stack gap={6}>
				<Text fw={700}>Books completed ({books.length})</Text>
				{books.length ? (
					books.map((book) => (
						<Group key={book.id} justify="space-between">
							<Text size="sm">{book.bookName}</Text>
							<Text size="sm" c="dimmed">
								{formatCompletedAt(book.completedAt)}
							</Text>
						</Group>
					))
				) : (
					<Text size="sm" c="dimmed">
						{isLoading ? 'Loading...' : 'No books completed yet'}
					</Text>
				)}
			</Stack>

			<Group justify="flex-end">
				<Button
					variant="default"
					leftSection={<IconFileTypePdf size={16} />}
					disabled={isLoading}
					onClick={handleExport}
				>
					Export PDF
				</Button>
				<Button leftSection={<IconPlus size={16} />} onClick={handleRecord}>
					Record Milestone
				</Button>
			</Group>
		</Stack>
	);
};
