-- Run after the new code is live: the monthly amount is no longer read
ALTER TABLE "public"."scholarships" DROP COLUMN "monthly_amount";
