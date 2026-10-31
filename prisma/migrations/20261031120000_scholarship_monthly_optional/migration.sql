-- Run before the new code goes live: new rows no longer send a monthly amount
ALTER TABLE "public"."scholarships" ALTER COLUMN "monthly_amount" DROP NOT NULL;
