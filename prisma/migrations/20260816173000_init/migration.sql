-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "public"."ProgramCode" AS ENUM ('HIFZ', 'WEEKEND');

-- CreateEnum
CREATE TYPE "public"."RecordStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "public"."ArchiveStatus" AS ENUM ('ACTIVE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "public"."Gender" AS ENUM ('BOY', 'GIRL');

-- CreateEnum
CREATE TYPE "public"."ClassSession" AS ENUM ('AM', 'PM', 'AM_PM', 'NA');

-- CreateEnum
CREATE TYPE "public"."EnrollmentStatus" AS ENUM ('ACTIVE', 'WITHDRAWN', 'COMPLETED');

-- CreateEnum
CREATE TYPE "public"."PayMethod" AS ENUM ('KEELA', 'ZELLE', 'CASH', 'CASHAPP', 'CHECK', 'FREE', 'OTHER', 'NA');

-- CreateEnum
CREATE TYPE "public"."PaymentStatus" AS ENUM ('PAID', 'PARTIAL', 'UNPAID', 'NA');

-- CreateEnum
CREATE TYPE "public"."PayrollStatus" AS ENUM ('DRAFT', 'PAID');

-- CreateTable
CREATE TABLE "public"."programs" (
    "id" TEXT NOT NULL,
    "code" "public"."ProgramCode" NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" "public"."ArchiveStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "programs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."families" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "father_name" TEXT,
    "mother_name" TEXT,
    "primary_phone" TEXT NOT NULL,
    "secondary_phone" TEXT,
    "email" TEXT,
    "address" TEXT,
    "status" "public"."RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "families_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."students" (
    "id" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "gender" "public"."Gender" NOT NULL,
    "date_of_birth" TIMESTAMP(3),
    "status" "public"."RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "enrolled_at" TIMESTAMP(3),
    "notes" TEXT,
    "family_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "students_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."teachers" (
    "id" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "phone_number" TEXT,
    "email" TEXT,
    "zelle_id" TEXT,
    "hourly_rate" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "status" "public"."RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "teachers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."classes" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "session" "public"."ClassSession" NOT NULL DEFAULT 'NA',
    "room" TEXT,
    "school_year" INTEGER NOT NULL,
    "capacity" INTEGER,
    "status" "public"."ArchiveStatus" NOT NULL DEFAULT 'ACTIVE',
    "program_id" TEXT NOT NULL,
    "teacher_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "classes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."enrollments" (
    "id" TEXT NOT NULL,
    "status" "public"."EnrollmentStatus" NOT NULL DEFAULT 'ACTIVE',
    "start_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "end_date" TIMESTAMP(3),
    "student_id" TEXT NOT NULL,
    "class_id" TEXT NOT NULL,
    "program_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "enrollments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."monthly_invoices" (
    "id" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "student_count" INTEGER NOT NULL DEFAULT 0,
    "session" "public"."ClassSession",
    "registration_fee" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "tuition_fee" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "book_fee" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "total_due" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "paid_registration_fee" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "paid_tuition_fee" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "paid_book_fee" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "extra_paid" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "total_paid" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "balance" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "pay_method" "public"."PayMethod" NOT NULL DEFAULT 'NA',
    "payment_status" "public"."PaymentStatus" NOT NULL DEFAULT 'UNPAID',
    "paid_at" TIMESTAMP(3),
    "notes" TEXT,
    "family_id" TEXT NOT NULL,
    "program_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "monthly_invoices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."payroll_periods" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "status" "public"."PayrollStatus" NOT NULL DEFAULT 'DRAFT',
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payroll_periods_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."payroll_entries" (
    "id" TEXT NOT NULL,
    "hourly_rate" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "weekday_hours" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "weekend_hours" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "weekday_pay" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "weekend_pay" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "total_pay" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "pay_status" "public"."PayrollStatus" NOT NULL DEFAULT 'DRAFT',
    "notes" TEXT,
    "period_id" TEXT NOT NULL,
    "teacher_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payroll_entries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "programs_code_key" ON "public"."programs"("code");

-- CreateIndex
CREATE UNIQUE INDEX "programs_name_key" ON "public"."programs"("name");

-- CreateIndex
CREATE INDEX "families_name_idx" ON "public"."families"("name");

-- CreateIndex
CREATE INDEX "students_family_id_idx" ON "public"."students"("family_id");

-- CreateIndex
CREATE UNIQUE INDEX "classes_name_program_id_school_year_key" ON "public"."classes"("name", "program_id", "school_year");

-- CreateIndex
CREATE INDEX "enrollments_class_id_idx" ON "public"."enrollments"("class_id");

-- CreateIndex
CREATE UNIQUE INDEX "enrollments_student_id_class_id_key" ON "public"."enrollments"("student_id", "class_id");

-- CreateIndex
CREATE INDEX "monthly_invoices_year_month_program_id_idx" ON "public"."monthly_invoices"("year", "month", "program_id");

-- CreateIndex
CREATE UNIQUE INDEX "monthly_invoices_family_id_program_id_year_month_key" ON "public"."monthly_invoices"("family_id", "program_id", "year", "month");

-- CreateIndex
CREATE INDEX "payroll_periods_year_month_idx" ON "public"."payroll_periods"("year", "month");

-- CreateIndex
CREATE UNIQUE INDEX "payroll_entries_period_id_teacher_id_key" ON "public"."payroll_entries"("period_id", "teacher_id");

-- AddForeignKey
ALTER TABLE "public"."students" ADD CONSTRAINT "students_family_id_fkey" FOREIGN KEY ("family_id") REFERENCES "public"."families"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."classes" ADD CONSTRAINT "classes_program_id_fkey" FOREIGN KEY ("program_id") REFERENCES "public"."programs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."classes" ADD CONSTRAINT "classes_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "public"."teachers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."enrollments" ADD CONSTRAINT "enrollments_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."enrollments" ADD CONSTRAINT "enrollments_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "public"."classes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."enrollments" ADD CONSTRAINT "enrollments_program_id_fkey" FOREIGN KEY ("program_id") REFERENCES "public"."programs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."monthly_invoices" ADD CONSTRAINT "monthly_invoices_family_id_fkey" FOREIGN KEY ("family_id") REFERENCES "public"."families"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."monthly_invoices" ADD CONSTRAINT "monthly_invoices_program_id_fkey" FOREIGN KEY ("program_id") REFERENCES "public"."programs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."payroll_entries" ADD CONSTRAINT "payroll_entries_period_id_fkey" FOREIGN KEY ("period_id") REFERENCES "public"."payroll_periods"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."payroll_entries" ADD CONSTRAINT "payroll_entries_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "public"."teachers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

