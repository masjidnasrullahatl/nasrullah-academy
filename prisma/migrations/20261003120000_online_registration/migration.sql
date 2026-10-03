-- AlterEnum
ALTER TYPE "public"."PayMethod" ADD VALUE 'CARD';

-- CreateEnum
CREATE TYPE "public"."RegistrationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterTable
ALTER TABLE "public"."programs"
ADD COLUMN "slug" TEXT,
ADD COLUMN "registration_open" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "registration_fee" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN "monthly_fees" DECIMAL(10,2)[] DEFAULT ARRAY[]::DECIMAL(10,2)[],
ADD COLUMN "class_times" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN "public_info" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "programs_slug_key" ON "public"."programs"("slug");

-- CreateTable
CREATE TABLE "public"."registrations" (
    "id" TEXT NOT NULL,
    "status" "public"."RegistrationStatus" NOT NULL DEFAULT 'PENDING',
    "parent_first_name" TEXT NOT NULL,
    "parent_last_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "emergency_phone" TEXT,
    "address" TEXT,
    "preferred_time" TEXT,
    "notes" TEXT,
    "students" JSONB NOT NULL,
    "student_count" INTEGER NOT NULL,
    "monthly_fee" DECIMAL(10,2) NOT NULL,
    "registration_fee" DECIMAL(10,2) NOT NULL,
    "amount_due" DECIMAL(10,2) NOT NULL,
    "pay_by_card" BOOLEAN NOT NULL DEFAULT false,
    "payment_status" "public"."PaymentStatus" NOT NULL DEFAULT 'UNPAID',
    "paid_at" TIMESTAMP(3),
    "stripe_session_id" TEXT,
    "stripe_customer_id" TEXT,
    "stripe_subscription_id" TEXT,
    "program_id" TEXT NOT NULL,
    "family_id" TEXT,
    "reviewed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "registrations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "registrations_stripe_session_id_key" ON "public"."registrations"("stripe_session_id");

-- CreateIndex
CREATE INDEX "registrations_status_idx" ON "public"."registrations"("status");

-- AddForeignKey
ALTER TABLE "public"."registrations" ADD CONSTRAINT "registrations_program_id_fkey" FOREIGN KEY ("program_id") REFERENCES "public"."programs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."registrations" ADD CONSTRAINT "registrations_family_id_fkey" FOREIGN KEY ("family_id") REFERENCES "public"."families"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Enable RLS for new table
ALTER TABLE "public"."registrations" ENABLE ROW LEVEL SECURITY;

-- Revoke privileges for anon/authenticated on new table
REVOKE ALL ON "public"."registrations" FROM anon, authenticated;
