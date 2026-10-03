-- CreateEnum
CREATE TYPE "public"."MilestoneType" AS ENUM ('JUZ', 'BOOK');

-- CreateTable
CREATE TABLE "public"."milestones" (
    "id" TEXT NOT NULL,
    "type" "public"."MilestoneType" NOT NULL,
    "juz_number" INTEGER,
    "book_name" TEXT,
    "completed_at" DATE NOT NULL,
    "notes" TEXT,
    "student_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "milestones_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "milestones_student_id_juz_number_key" ON "public"."milestones"("student_id", "juz_number");

-- CreateIndex
CREATE INDEX "milestones_completed_at_idx" ON "public"."milestones"("completed_at");

-- AddForeignKey
ALTER TABLE "public"."milestones" ADD CONSTRAINT "milestones_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Enable RLS for new table
ALTER TABLE "public"."milestones" ENABLE ROW LEVEL SECURITY;

-- Revoke privileges for anon/authenticated on new table
REVOKE ALL ON "public"."milestones" FROM anon, authenticated;
