-- CreateEnum
CREATE TYPE "public"."PayPeriodStatus" AS ENUM ('OPEN', 'LOCKED', 'PAID');

-- CreateTable
CREATE TABLE "public"."programs" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" "public"."ArchiveStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "programs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."pay_periods" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "status" "public"."PayPeriodStatus" NOT NULL DEFAULT 'OPEN',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pay_periods_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."time_entries" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "hours" DECIMAL(5,2) NOT NULL,
    "notes" TEXT,
    "teacher_id" TEXT NOT NULL,
    "class_id" TEXT NOT NULL,
    "pay_period_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "time_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."teacher_submissions" (
    "id" TEXT NOT NULL,
    "submitted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "teacher_id" TEXT NOT NULL,
    "pay_period_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "teacher_submissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."pay_records" (
    "id" TEXT NOT NULL,
    "total_hours" DECIMAL(10,2) NOT NULL,
    "hourly_rate" DECIMAL(10,2) NOT NULL,
    "total_pay" DECIMAL(10,2) NOT NULL,
    "teacher_id" TEXT NOT NULL,
    "pay_period_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pay_records_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "public"."teachers"
ADD COLUMN "hourly_rate" DECIMAL(10,2),
ADD COLUMN "supabase_user_id" TEXT;

-- AlterTable
ALTER TABLE "public"."classes"
ADD COLUMN "program_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."monthly_invoices"
ADD COLUMN "program_id" TEXT NOT NULL,
DROP COLUMN "session";

-- DropIndex
DROP INDEX "public"."classes_name_key";

-- DropIndex
DROP INDEX "public"."monthly_invoices_family_id_year_month_key";

-- CreateIndex
CREATE UNIQUE INDEX "programs_name_key" ON "public"."programs"("name");

-- CreateIndex
CREATE UNIQUE INDEX "teachers_supabase_user_id_key" ON "public"."teachers"("supabase_user_id");

-- CreateIndex
CREATE UNIQUE INDEX "classes_name_program_id_key" ON "public"."classes"("name", "program_id");

-- CreateIndex
CREATE UNIQUE INDEX "monthly_invoices_family_id_program_id_year_month_key" ON "public"."monthly_invoices"("family_id", "program_id", "year", "month");

-- CreateIndex
CREATE INDEX "time_entries_teacher_id_pay_period_id_idx" ON "public"."time_entries"("teacher_id", "pay_period_id");

-- CreateIndex
CREATE INDEX "time_entries_pay_period_id_idx" ON "public"."time_entries"("pay_period_id");

-- CreateIndex
CREATE UNIQUE INDEX "teacher_submissions_teacher_id_pay_period_id_key" ON "public"."teacher_submissions"("teacher_id", "pay_period_id");

-- CreateIndex
CREATE UNIQUE INDEX "pay_records_teacher_id_pay_period_id_key" ON "public"."pay_records"("teacher_id", "pay_period_id");

-- AddForeignKey
ALTER TABLE "public"."classes" ADD CONSTRAINT "classes_program_id_fkey" FOREIGN KEY ("program_id") REFERENCES "public"."programs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."monthly_invoices" ADD CONSTRAINT "monthly_invoices_program_id_fkey" FOREIGN KEY ("program_id") REFERENCES "public"."programs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."time_entries" ADD CONSTRAINT "time_entries_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "public"."teachers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."time_entries" ADD CONSTRAINT "time_entries_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "public"."classes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."time_entries" ADD CONSTRAINT "time_entries_pay_period_id_fkey" FOREIGN KEY ("pay_period_id") REFERENCES "public"."pay_periods"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."teacher_submissions" ADD CONSTRAINT "teacher_submissions_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "public"."teachers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."teacher_submissions" ADD CONSTRAINT "teacher_submissions_pay_period_id_fkey" FOREIGN KEY ("pay_period_id") REFERENCES "public"."pay_periods"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."pay_records" ADD CONSTRAINT "pay_records_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "public"."teachers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."pay_records" ADD CONSTRAINT "pay_records_pay_period_id_fkey" FOREIGN KEY ("pay_period_id") REFERENCES "public"."pay_periods"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- DropEnum
DROP TYPE "public"."ClassSession";

-- Enable RLS for new tables
ALTER TABLE "public"."programs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."pay_periods" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."time_entries" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."teacher_submissions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."pay_records" ENABLE ROW LEVEL SECURITY;

-- Revoke privileges for anon/authenticated on new tables
REVOKE ALL ON "public"."programs" FROM anon, authenticated;
REVOKE ALL ON "public"."pay_periods" FROM anon, authenticated;
REVOKE ALL ON "public"."time_entries" FROM anon, authenticated;
REVOKE ALL ON "public"."teacher_submissions" FROM anon, authenticated;
REVOKE ALL ON "public"."pay_records" FROM anon, authenticated;
