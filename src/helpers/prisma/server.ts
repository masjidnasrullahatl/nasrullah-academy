import Prisma from '@prisma/client';

export const createClient = () => {
	const prisma = new Prisma.PrismaClient();
	return prisma;
};
