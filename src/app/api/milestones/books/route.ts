import { success } from '@app/api/utils/response';
import { withStaff } from '@app/api/utils/withStaff';

import { createClient } from '@helpers/prisma/server';

// Book names already recorded, offered as suggestions so spelling stays consistent
const getBookNames = async () => {
	const prisma = createClient();

	const books = await prisma.milestones.findMany({
		where: { type: 'BOOK', bookName: { not: null } },
		distinct: ['bookName'],
		select: { bookName: true },
		orderBy: { bookName: 'asc' },
	});

	return success(books.map((book) => book.bookName));
};

export const GET = withStaff(getBookNames);
