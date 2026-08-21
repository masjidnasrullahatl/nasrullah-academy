import {
	ArchiveStatus,
	ClassSession,
	PaymentStatus,
	PayMethod,
	PrismaClient,
	ProgramCode,
	RecordStatus,
} from '@prisma/client';

const prisma = new PrismaClient();

const YEAR = 2026;

const round2 = (value: number) => Math.round(value * 100) / 100;

const allocatePaid = (
	totalPaid: number,
	registrationFee: number,
	tuitionFee: number,
	bookFee: number,
) => {
	let remaining = round2(totalPaid);

	const paidRegistrationFee = round2(Math.min(registrationFee, remaining));
	remaining = round2(remaining - paidRegistrationFee);

	const paidTuitionFee = round2(Math.min(tuitionFee, remaining));
	remaining = round2(remaining - paidTuitionFee);

	const paidBookFee = round2(Math.min(bookFee, remaining));
	remaining = round2(remaining - paidBookFee);

	const extraPaid = round2(Math.max(0, remaining));

	return {
		paidRegistrationFee,
		paidTuitionFee,
		paidBookFee,
		extraPaid,
	};
};

async function seedPrograms() {
	const hifz = await prisma.programs.upsert({
		where: { code: ProgramCode.HIFZ },
		update: {
			name: 'Hifz Program',
			description: 'Quran memorization and tajweed focus',
			status: ArchiveStatus.ACTIVE,
		},
		create: {
			code: ProgramCode.HIFZ,
			name: 'Hifz Program',
			description: 'Quran memorization and tajweed focus',
			status: ArchiveStatus.ACTIVE,
		},
	});

	const weekend = await prisma.programs.upsert({
		where: { code: ProgramCode.WEEKEND },
		update: {
			name: 'Weekend School',
			description: 'Weekend Islamic studies and language program',
			status: ArchiveStatus.ACTIVE,
		},
		create: {
			code: ProgramCode.WEEKEND,
			name: 'Weekend School',
			description: 'Weekend Islamic studies and language program',
			status: ArchiveStatus.ACTIVE,
		},
	});

	return { hifz, weekend };
}

async function resetTransactionalTables() {
	await prisma.enrollments.deleteMany();
	await prisma.monthlyInvoices.deleteMany();
	await prisma.classes.deleteMany();
	await prisma.students.deleteMany();
	await prisma.teachers.deleteMany();
	await prisma.families.deleteMany();
}

async function seedTeachers() {
	const teacherSeeds = [
		{
			firstName: 'Saleem',
			lastName: 'Syed',
			phoneNumber: '678-201-4401',
			email: 'saleem.syed@masjidnasrullah.org',
		},
		{
			firstName: 'Taha',
			lastName: 'Jamal',
			phoneNumber: '470-322-9184',
			email: 'taha.jamal@masjidnasrullah.org',
		},
		{
			firstName: 'Monirul',
			lastName: 'Alam',
			phoneNumber: '404-890-2661',
			email: 'monirul.alam@masjidnasrullah.org',
		},
		{
			firstName: 'Oli Ullah',
			lastName: 'Islam',
			phoneNumber: '678-433-5570',
			email: 'oli.ullah@masjidnasrullah.org',
		},
		{
			firstName: 'Aida',
			lastName: 'Rahman',
			phoneNumber: '770-881-9023',
			email: 'aida.rahman@masjidnasrullah.org',
		},
		{
			firstName: 'Muhammed',
			lastName: 'Elsalamy',
			phoneNumber: '404-781-4488',
			email: 'muhammed.elsalamy@masjidnasrullah.org',
		},
	];

	const teachers = [];

	for (const teacherSeed of teacherSeeds) {
		const teacher = await prisma.teachers.create({
			data: {
				...teacherSeed,
				status: RecordStatus.ACTIVE,
			},
		});

		teachers.push(teacher);
	}

	return teachers;
}

async function seedClasses(programIds: { hifzId: string; weekendId: string }, teacherIds: string[]) {
	const classSeeds = [
		{
			name: 'Hifz 1',
			session: ClassSession.NA,
			programId: programIds.hifzId,
			teacherId: teacherIds[0],
			room: 'Room A',
		},
		{
			name: 'Hifz 2',
			session: ClassSession.NA,
			programId: programIds.hifzId,
			teacherId: teacherIds[1],
			room: 'Room B',
		},
		{
			name: 'Hifz 3',
			session: ClassSession.NA,
			programId: programIds.hifzId,
			teacherId: teacherIds[2],
			room: 'Room C',
		},
		{
			name: 'Weekend A',
			session: ClassSession.AM,
			programId: programIds.weekendId,
			teacherId: teacherIds[3],
			room: 'Room D',
		},
		{
			name: 'Weekend B',
			session: ClassSession.PM,
			programId: programIds.weekendId,
			teacherId: teacherIds[4],
			room: 'Room E',
		},
		{
			name: 'Weekend C',
			session: ClassSession.AM_PM,
			programId: programIds.weekendId,
			teacherId: teacherIds[5],
			room: 'Room F',
		},
	];

	const classes = [];

	for (const classSeed of classSeeds) {
		const classItem = await prisma.classes.upsert({
			where: {
				name_programId_schoolYear: {
					name: classSeed.name,
					programId: classSeed.programId,
					schoolYear: YEAR,
				},
			},
			update: {
				session: classSeed.session,
				room: classSeed.room,
				capacity: 20,
				status: ArchiveStatus.ACTIVE,
				teacherId: classSeed.teacherId,
			},
			create: {
				name: classSeed.name,
				session: classSeed.session,
				room: classSeed.room,
				schoolYear: YEAR,
				capacity: 20,
				status: ArchiveStatus.ACTIVE,
				programId: classSeed.programId,
				teacherId: classSeed.teacherId,
			},
		});

		classes.push(classItem);
	}

	return classes;
}

async function seedFamiliesAndStudents() {
	const familySeeds = [
		{
			name: 'Ibrahima Alpha Diallo',
			fatherName: 'Ibrahima Diallo',
			motherName: 'Aminata Diallo',
			primaryPhone: '404-838-3879',
			secondaryPhone: '470-555-1111 (mother)',
			email: 'diallo.family@example.com',
			address: '300 River Glen Dr, Lawrenceville, GA',
			status: RecordStatus.ACTIVE,
		},
		{
			name: 'A.R. Rafiqul Alam',
			fatherName: 'Rafiqul Alam',
			motherName: 'Samina Alam',
			primaryPhone: '678-442-2019',
			secondaryPhone: '678-442-2020 (father)',
			email: 'alam.family@example.com',
			address: '29 Fox Creek Dr, Suwanee, GA',
			status: RecordStatus.ACTIVE,
		},
		{
			name: 'Merina Parvin',
			fatherName: 'Shafiqul Parvin',
			motherName: 'Merina Parvin',
			primaryPhone: '770-901-8834',
			secondaryPhone: null,
			email: 'parvin.family@example.com',
			address: '5511 Pleasant Hill Rd, Lilburn, GA',
			status: RecordStatus.ACTIVE,
		},
		{
			name: 'Farhana Sultana',
			fatherName: 'Mahmudul Hasan',
			motherName: 'Farhana Sultana',
			primaryPhone: '404-291-7726',
			secondaryPhone: null,
			email: 'sultana.family@example.com',
			address: '881 Beaver Ruin Rd, Norcross, GA',
			status: RecordStatus.ACTIVE,
		},
		{
			name: 'Nasrin Jahan',
			fatherName: 'Saifuddin Ahmed',
			motherName: 'Nasrin Jahan',
			primaryPhone: '470-728-4422',
			secondaryPhone: '470-728-3322 (father)',
			email: 'jahan.family@example.com',
			address: '4000 Satellite Blvd, Duluth, GA',
			status: RecordStatus.ACTIVE,
		},
		{
			name: 'Rashida Akter',
			fatherName: 'Abul Kashem',
			motherName: 'Rashida Akter',
			primaryPhone: '770-322-1908',
			secondaryPhone: null,
			email: 'akter.family@example.com',
			address: '2705 Old Norcross Rd, Lawrenceville, GA',
			status: RecordStatus.ACTIVE,
		},
		{
			name: 'Md. Jahidul Islam',
			fatherName: 'Jahidul Islam',
			motherName: 'Shamima Islam',
			primaryPhone: '678-920-7741',
			secondaryPhone: null,
			email: 'jahidul.family@example.com',
			address: '90 Club Dr, Lawrenceville, GA',
			status: RecordStatus.ACTIVE,
		},
		{
			name: 'Sabrina Hossain',
			fatherName: 'Imran Hossain',
			motherName: 'Sabrina Hossain',
			primaryPhone: '404-551-1180',
			secondaryPhone: null,
			email: 'hossain.family@example.com',
			address: '4800 Jimmy Carter Blvd, Norcross, GA',
			status: RecordStatus.ACTIVE,
		},
		{
			name: 'Rumana Khatun',
			fatherName: 'Khaled Hossain',
			motherName: 'Rumana Khatun',
			primaryPhone: '470-993-4417',
			secondaryPhone: null,
			email: 'khatun.family@example.com',
			address: '1300 Indian Trail Rd, Norcross, GA',
			status: RecordStatus.ACTIVE,
		},
		{
			name: 'Sadia Rahman',
			fatherName: 'Rezaur Rahman',
			motherName: 'Sadia Rahman',
			primaryPhone: '678-310-7743',
			secondaryPhone: '678-310-7744 (mother)',
			email: 'sadia.family@example.com',
			address: '3200 Old Peachtree Rd, Duluth, GA',
			status: RecordStatus.ACTIVE,
		},
		{
			name: 'Nusrat Karim',
			fatherName: 'Tariqul Karim',
			motherName: 'Nusrat Karim',
			primaryPhone: '770-400-0088',
			secondaryPhone: null,
			email: 'karim.family@example.com',
			address: '4420 Buford Hwy, Atlanta, GA',
			status: RecordStatus.ACTIVE,
		},
		{
			name: 'Mahmuda Chowdhury',
			fatherName: 'Sharif Chowdhury',
			motherName: 'Mahmuda Chowdhury',
			primaryPhone: '404-917-1102',
			secondaryPhone: null,
			email: 'chowdhury.family@example.com',
			address: '2505 Holcomb Bridge Rd, Alpharetta, GA',
			status: RecordStatus.ACTIVE,
		},
		{
			name: 'Nazia Anwar',
			fatherName: 'Anisur Anwar',
			motherName: 'Nazia Anwar',
			primaryPhone: '678-919-4428',
			secondaryPhone: null,
			email: 'anwar.family@example.com',
			address: '920 Pleasant Hill Rd, Lilburn, GA',
			status: RecordStatus.INACTIVE,
		},
		{
			name: 'Sohag Mia',
			fatherName: 'Sohag Mia',
			motherName: 'Sharmin Akter',
			primaryPhone: '470-771-1221',
			secondaryPhone: null,
			email: 'sohag.family@example.com',
			address: '1501 Indian Trail Lilburn Rd, Norcross, GA',
			status: RecordStatus.INACTIVE,
		},
		{
			name: 'Fatema Begum',
			fatherName: 'Abdur Rahman',
			motherName: 'Fatema Begum',
			primaryPhone: '404-771-9822',
			secondaryPhone: null,
			email: 'fatema.family@example.com',
			address: '3900 Lavista Rd, Tucker, GA',
			status: RecordStatus.INACTIVE,
		},
	];

	const families = [];
	for (const familySeed of familySeeds) {
		const family = await prisma.families.create({
			data: {
				...familySeed,
				notes: familySeed.status === RecordStatus.INACTIVE ? 'Temporarily inactive account' : null,
			},
		});
		families.push(family);
	}

	const studentCountsPerFamily = [3, 2, 2, 1, 2, 3, 2, 1, 2, 3, 2, 1, 2, 2, 2];
	const studentNames: Array<{ firstName: string; lastName: string; gender: 'BOY' | 'GIRL' }> = [
		{ firstName: 'Yusuf', lastName: 'Diallo', gender: 'BOY' },
		{ firstName: 'Fatimah', lastName: 'Diallo', gender: 'GIRL' },
		{ firstName: 'Ibrahim', lastName: 'Diallo', gender: 'BOY' },
		{ firstName: 'Ahmed', lastName: 'Alam', gender: 'BOY' },
		{ firstName: 'Maryam', lastName: 'Alam', gender: 'GIRL' },
		{ firstName: 'Bilal', lastName: 'Parvin', gender: 'BOY' },
		{ firstName: 'Ruqayyah', lastName: 'Parvin', gender: 'GIRL' },
		{ firstName: 'Hamza', lastName: 'Hasan', gender: 'BOY' },
		{ firstName: 'Abdullah', lastName: 'Ahmed', gender: 'BOY' },
		{ firstName: 'Amina', lastName: 'Ahmed', gender: 'GIRL' },
		{ firstName: 'Musa', lastName: 'Kashem', gender: 'BOY' },
		{ firstName: 'Hafsa', lastName: 'Kashem', gender: 'GIRL' },
		{ firstName: 'Khalid', lastName: 'Kashem', gender: 'BOY' },
		{ firstName: 'Sami', lastName: 'Islam', gender: 'BOY' },
		{ firstName: 'Nour', lastName: 'Islam', gender: 'GIRL' },
		{ firstName: 'Rayyan', lastName: 'Hossain', gender: 'BOY' },
		{ firstName: 'Sara', lastName: 'Khatun', gender: 'GIRL' },
		{ firstName: 'Imran', lastName: 'Khatun', gender: 'BOY' },
		{ firstName: 'Hassan', lastName: 'Rahman', gender: 'BOY' },
		{ firstName: 'Tasnim', lastName: 'Rahman', gender: 'GIRL' },
		{ firstName: 'Umar', lastName: 'Rahman', gender: 'BOY' },
		{ firstName: 'Sulaiman', lastName: 'Karim', gender: 'BOY' },
		{ firstName: 'Laila', lastName: 'Karim', gender: 'GIRL' },
		{ firstName: 'Adam', lastName: 'Chowdhury', gender: 'BOY' },
		{ firstName: 'Anas', lastName: 'Anwar', gender: 'BOY' },
		{ firstName: 'Mariam', lastName: 'Anwar', gender: 'GIRL' },
		{ firstName: 'Tariq', lastName: 'Mia', gender: 'BOY' },
		{ firstName: 'Yasmin', lastName: 'Mia', gender: 'GIRL' },
		{ firstName: 'Harun', lastName: 'Begum', gender: 'BOY' },
		{ firstName: 'Salma', lastName: 'Begum', gender: 'GIRL' },
	];

	const students = [];
	let studentIndex = 0;

	for (let familyIndex = 0; familyIndex < families.length; familyIndex += 1) {
		const family = families[familyIndex];
		const count = studentCountsPerFamily[familyIndex];

		for (let localIndex = 0; localIndex < count; localIndex += 1) {
			const studentSeed = studentNames[studentIndex];
			const birthYear = 2010 + (studentIndex % 9);
			const birthMonth = (studentIndex % 12) + 1;
			const birthDay = (studentIndex % 26) + 1;

			const student = await prisma.students.create({
				data: {
					firstName: studentSeed.firstName,
					lastName: studentSeed.lastName,
					gender: studentSeed.gender,
					dateOfBirth: new Date(Date.UTC(birthYear, birthMonth - 1, birthDay)),
					status: RecordStatus.ACTIVE,
					enrolledAt: new Date(Date.UTC(2026, 0, (studentIndex % 15) + 1)),
					familyId: family.id,
				},
			});

			students.push(student);
			studentIndex += 1;
		}
	}

	return { families, students };
}

async function seedEnrollments(
	students: Array<{ id: string; familyId: string; status: RecordStatus }>,
	classes: Array<{ id: string; programId: string }>,
	programIds: { hifzId: string; weekendId: string },
) {
	const hifzClasses = classes.filter((item) => item.programId === programIds.hifzId);
	const weekendClasses = classes.filter((item) => item.programId === programIds.weekendId);

	const enrollments: Array<{
		studentId: string;
		classId: string;
		programId: string;
	}> = [];

	for (let index = 0; index < students.length; index += 1) {
		const student = students[index];
		if (student.status !== RecordStatus.ACTIVE) {
			continue;
		}

		const primaryIsHifz = index % 3 === 0;
		const primaryClass = primaryIsHifz
			? hifzClasses[index % hifzClasses.length]
			: weekendClasses[index % weekendClasses.length];

		enrollments.push({
			studentId: student.id,
			classId: primaryClass.id,
			programId: primaryClass.programId,
		});

		if (index < 5) {
			const secondaryClass = primaryIsHifz
				? weekendClasses[index % weekendClasses.length]
				: hifzClasses[index % hifzClasses.length];

			enrollments.push({
				studentId: student.id,
				classId: secondaryClass.id,
				programId: secondaryClass.programId,
			});
		}
	}

	for (let index = 0; index < enrollments.length; index += 1) {
		const enrollment = enrollments[index];
		await prisma.enrollments.create({
			data: {
				studentId: enrollment.studentId,
				classId: enrollment.classId,
				programId: enrollment.programId,
				status: 'ACTIVE',
				startDate: new Date(Date.UTC(2026, 0, (index % 20) + 1)),
			},
		});
	}

	return enrollments;
}

async function seedMonthlyInvoices(
	families: Array<{ id: string; status: RecordStatus }>,
	students: Array<{ id: string; familyId: string; status: RecordStatus }>,
	enrollments: Array<{ studentId: string; programId: string }>,
	programIds: { hifzId: string; weekendId: string },
) {
	const activeFamilyIds = new Set(
		families
			.filter((family) => family.status === RecordStatus.ACTIVE)
			.map((family) => family.id),
	);

	const studentById = new Map(students.map((student) => [student.id, student]));

	const familyProgramStudents = new Map<string, Set<string>>();
	for (const enrollment of enrollments) {
		const student = studentById.get(enrollment.studentId);
		if (!student || student.status !== RecordStatus.ACTIVE) {
			continue;
		}
		if (!activeFamilyIds.has(student.familyId)) {
			continue;
		}

		const key = `${student.familyId}_${enrollment.programId}`;
		if (!familyProgramStudents.has(key)) {
			familyProgramStudents.set(key, new Set());
		}
		familyProgramStudents.get(key)?.add(student.id);
	}

	const keys = Array.from(familyProgramStudents.keys());
	const payMethodCycle = [PayMethod.KEELA, PayMethod.ZELLE, PayMethod.CASH, PayMethod.CASHAPP];
	let invoiceIndex = 0;

	for (const key of keys) {
		const [familyId, programId] = key.split('_');
		const studentCount = familyProgramStudents.get(key)?.size ?? 0;

		for (let month = 1; month <= 6; month += 1) {
			const isHifz = programId === programIds.hifzId;
			const registrationFee = month === 1 ? (isHifz ? 40 : 25) : 0;
			const baseTuition = isHifz
				? 150 * studentCount
				: 60 + Math.max(0, studentCount - 1) * 50;
			const scholarshipDiscount = invoiceIndex % 9 === 0 ? round2(baseTuition * 0.2) : 0;
			const tuitionFee = round2(baseTuition - scholarshipDiscount);
			const bookFee = month <= 2 ? round2(studentCount * (isHifz ? 12 : 8)) : 0;

			let totalDue = round2(registrationFee + tuitionFee + bookFee);
			let payMethod: PayMethod = payMethodCycle[invoiceIndex % payMethodCycle.length];
			let paymentStatus: PaymentStatus;
			let totalPaid: number;
			let paidAt: Date | null;

			if (invoiceIndex % 23 === 0) {
				totalDue = 0;
				payMethod = PayMethod.FREE;
				paymentStatus = PaymentStatus.PAID;
				totalPaid = 0;
				paidAt = new Date(Date.UTC(YEAR, month - 1, 5));
			} else {
				const bucket = invoiceIndex % 20;
				if (bucket <= 14) {
					paymentStatus = PaymentStatus.PAID;
					totalPaid = totalDue;
					paidAt = new Date(Date.UTC(YEAR, month - 1, 21));
				} else if (bucket <= 17) {
					paymentStatus = PaymentStatus.PARTIAL;
					const ratio = [0.45, 0.6, 0.75][invoiceIndex % 3];
					totalPaid = round2(totalDue * ratio);
					paidAt = new Date(Date.UTC(YEAR, month - 1, 18));
				} else {
					paymentStatus = PaymentStatus.UNPAID;
					totalPaid = 0;
					paidAt = null;
				}
			}

			const {
				paidRegistrationFee,
				paidTuitionFee,
				paidBookFee,
				extraPaid,
			} = allocatePaid(totalPaid, registrationFee, tuitionFee, bookFee);
			const computedTotalPaid = round2(
				paidRegistrationFee + paidTuitionFee + paidBookFee + extraPaid,
			);
			const balance = round2(totalDue - computedTotalPaid);

			await prisma.monthlyInvoices.upsert({
				where: {
					familyId_programId_year_month: {
						familyId,
						programId,
						year: YEAR,
						month,
					},
				},
				update: {
					studentCount,
					session: isHifz
						? ClassSession.NA
						: [ClassSession.AM, ClassSession.PM, ClassSession.AM_PM][
								(invoiceIndex + month) % 3
							],
					registrationFee,
					tuitionFee,
					bookFee,
					totalDue,
					paidRegistrationFee,
					paidTuitionFee,
					paidBookFee,
					extraPaid,
					totalPaid: computedTotalPaid,
					balance,
					payMethod,
					paymentStatus,
					paidAt,
					notes:
						scholarshipDiscount > 0
							? `Scholarship applied: $${scholarshipDiscount.toFixed(2)}`
							: null,
				},
				create: {
					familyId,
					programId,
					year: YEAR,
					month,
					studentCount,
					session: isHifz
						? ClassSession.NA
						: [ClassSession.AM, ClassSession.PM, ClassSession.AM_PM][
								(invoiceIndex + month) % 3
							],
					registrationFee,
					tuitionFee,
					bookFee,
					totalDue,
					paidRegistrationFee,
					paidTuitionFee,
					paidBookFee,
					extraPaid,
					totalPaid: computedTotalPaid,
					balance,
					payMethod,
					paymentStatus,
					paidAt,
					notes:
						scholarshipDiscount > 0
							? `Scholarship applied: $${scholarshipDiscount.toFixed(2)}`
							: null,
				},
			});

			invoiceIndex += 1;
		}
	}
}

async function printSummary() {
	const [
		programs,
		families,
		students,
		teachers,
		classes,
		enrollments,
		monthlyInvoices,
	] = await Promise.all([
		prisma.programs.count(),
		prisma.families.count(),
		prisma.students.count(),
		prisma.teachers.count(),
		prisma.classes.count(),
		prisma.enrollments.count(),
		prisma.monthlyInvoices.count(),
	]);

	console.log('Seed completed with table counts:');
	console.log(`- Programs: ${programs}`);
	console.log(`- Families: ${families}`);
	console.log(`- Students: ${students}`);
	console.log(`- Teachers: ${teachers}`);
	console.log(`- Classes: ${classes}`);
	console.log(`- Enrollments: ${enrollments}`);
	console.log(`- MonthlyInvoices: ${monthlyInvoices}`);
}

async function main() {
	const programs = await seedPrograms();
	await resetTransactionalTables();

	const teachers = await seedTeachers();
	const classes = await seedClasses(
		{ hifzId: programs.hifz.id, weekendId: programs.weekend.id },
		teachers.map((teacher) => teacher.id),
	);

	const { families, students } = await seedFamiliesAndStudents();
	const enrollments = await seedEnrollments(
		students,
		classes,
		{ hifzId: programs.hifz.id, weekendId: programs.weekend.id },
	);

	await seedMonthlyInvoices(
		families,
		students,
		enrollments,
		{ hifzId: programs.hifz.id, weekendId: programs.weekend.id },
	);

	await printSummary();
}

main()
	.then(async () => {
		await prisma.$disconnect();
		process.exit(0);
	})
	.catch(async (error) => {
		console.error(error);
		await prisma.$disconnect();
		process.exit(1);
	});
