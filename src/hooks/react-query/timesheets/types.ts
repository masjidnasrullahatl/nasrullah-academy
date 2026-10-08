export type TimesheetProgram = { id: string; name: string; hours: number };

export type TimesheetRow = {
	teacherId: string;
	teacherName: string;
	hourlyRate: number;
	programs: TimesheetProgram[];
	totalHours: number;
	submittedAt: string | null;
};

export type ProgramHoursInput = Array<{ programId: string; hours: number }>;
