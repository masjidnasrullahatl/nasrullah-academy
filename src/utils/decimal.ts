// Convert Prisma Decimal (or null) to a plain number for JSON responses.
export const toNumber = (value: unknown): number => Number(value ?? 0);
