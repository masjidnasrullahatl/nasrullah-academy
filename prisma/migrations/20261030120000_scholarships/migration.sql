-- CreateTable
CREATE TABLE "public"."scholarships" (
    "id" TEXT NOT NULL,
    "donor_name" TEXT,
    "amount_received" DECIMAL(10,2) NOT NULL,
    "received_at" DATE,
    "monthly_amount" DECIMAL(10,2) NOT NULL,
    "start_month" DATE NOT NULL,
    "end_month" DATE,
    "notes" TEXT,
    "student_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "scholarships_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "scholarships_student_id_idx" ON "public"."scholarships"("student_id");

-- AddForeignKey
ALTER TABLE "public"."scholarships" ADD CONSTRAINT "scholarships_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Enable RLS for new table
ALTER TABLE "public"."scholarships" ENABLE ROW LEVEL SECURITY;

-- Revoke privileges for anon/authenticated on new table
REVOKE ALL ON "public"."scholarships" FROM anon, authenticated;
