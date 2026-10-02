-- AlterTable
ALTER TABLE "public"."family_programs"
ADD COLUMN "student_count" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "monthly_fee" DECIMAL(10,2) NOT NULL DEFAULT 0;
