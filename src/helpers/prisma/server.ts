import Prisma from '@prisma/client';

declare global {
	 
	var prisma: Prisma.PrismaClient | undefined;
}

export const createClient = () => {
	if (!global.prisma) {
		global.prisma = new Prisma.PrismaClient();
	}

	return global.prisma;
};
