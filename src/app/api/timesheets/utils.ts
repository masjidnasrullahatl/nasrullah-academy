import { PayPeriods, Prisma, PrismaClient } from '@prisma/client';
import keyBy from 'lodash/keyBy';
import sortBy from 'lodash/sortBy';
import sumBy from 'lodash/sumBy';
import z from 'zod/v4';

type Db = Prisma.TransactionClient | PrismaClient;

// Hours for one pay period are entered as a single total per program.
export const ProgramHoursSchema = z
	.array(
		z.object({
			programId: z.string().min(1),
			hours: z
				.number()
				.min(0)
				.max(500)
				.refine((value) => Number.isInteger(value * 4), {
					message: 'Hours must be in quarter-hour steps (e.g. 12.25)',
				}),
		}),
	)
	.min(1);

export type ProgramHours = z.infer<typeof ProgramHoursSchema>;

export type TimesheetRow = {
	teacherId: string;
	teacherName: string;
	hourlyRate: number;
	programs: Array<{ id: string; name: string; hours: number }>;
	totalHours: number;
	submittedAt: Date | null;
};

/**
 * One row per teacher for a pay period: every active teacher assigned to a
 * program, plus anyone who already has hours in the period.
 */
export const getTimesheets = async (
	prisma: Db,
	payPeriodId: string,
	teacherId?: string,
): Promise<TimesheetRow[]> => {
	const teacherFilter = teacherId ? { teacherId } : {};

	const [teachers, hourGroups, submissions, programs] = await Promise.all([
		prisma.teachers.findMany({
			where: {
				...(teacherId ? { id: teacherId } : {}),
				OR: [
					{ status: 'ACTIVE', programs: { some: {} } },
					{ timeEntries: { some: { payPeriodId } } },
				],
			},
			select: {
				id: true,
				firstName: true,
				lastName: true,
				hourlyRate: true,
				programs: { select: { programId: true } },
			},
			orderBy: [{ firstName: 'asc' }, { lastName: 'asc' }],
		}),
		prisma.timeEntries.groupBy({
			by: ['teacherId', 'programId'],
			where: { payPeriodId, ...teacherFilter },
			_sum: { hours: true },
		}),
		prisma.teacherSubmissions.findMany({
			where: { payPeriodId, ...teacherFilter },
			select: { teacherId: true, submittedAt: true },
		}),
		prisma.programs.findMany({ select: { id: true, name: true } }),
	]);

	const programById = keyBy(programs, 'id');
	const submissionByTeacher = keyBy(submissions, 'teacherId');

	return teachers.map((teacher) => {
		const groups = hourGroups.filter((group) => group.teacherId === teacher.id);

		const programIds = new Set([
			...teacher.programs.map((item) => item.programId),
			...groups.map((group) => group.programId),
		]);

		const programHours = sortBy(
			[...programIds]
				.filter((id) => programById[id])
				.map((id) => ({
					id,
					name: programById[id].name,
					hours: Number(
						groups.find((group) => group.programId === id)?._sum.hours || 0,
					),
				})),
			'name',
		);

		return {
			teacherId: teacher.id,
			teacherName: `${teacher.firstName} ${teacher.lastName}`,
			hourlyRate: Number(teacher.hourlyRate || 0),
			programs: programHours,
			totalHours: sumBy(programHours, 'hours'),
			submittedAt: submissionByTeacher[teacher.id]?.submittedAt || null,
		};
	});
};

/** Replaces a teacher's hours for each given program in the pay period. */
export const saveTimesheet = async (
	tx: Prisma.TransactionClient,
	teacherId: string,
	payPeriod: Pick<PayPeriods, 'id' | 'endDate'>,
	hours: ProgramHours,
) => {
	for (const item of hours) {
		await tx.timeEntries.deleteMany({
			where: {
				teacherId,
				payPeriodId: payPeriod.id,
				programId: item.programId,
			},
		});

		if (item.hours > 0) {
			await tx.timeEntries.create({
				data: {
					teacherId,
					payPeriodId: payPeriod.id,
					programId: item.programId,
					hours: item.hours,
					date: payPeriod.endDate,
				},
			});
		}
	}
};
