-- CreateTable
CREATE TABLE "public"."teacher_programs" (
    "teacher_id" TEXT NOT NULL,
    "program_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "teacher_programs_pkey" PRIMARY KEY ("teacher_id","program_id")
);

-- CreateIndex
CREATE INDEX "teacher_programs_program_id_idx" ON "public"."teacher_programs"("program_id");

-- AddForeignKey
ALTER TABLE "public"."teacher_programs" ADD CONSTRAINT "teacher_programs_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "public"."teachers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."teacher_programs" ADD CONSTRAINT "teacher_programs_program_id_fkey" FOREIGN KEY ("program_id") REFERENCES "public"."programs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Enable RLS for new table
ALTER TABLE "public"."teacher_programs" ENABLE ROW LEVEL SECURITY;

-- Revoke privileges for anon/authenticated on new table
REVOKE ALL ON "public"."teacher_programs" FROM anon, authenticated;

-- Backfill: teachers teach the programs of the classes they are assigned to
INSERT INTO "public"."teacher_programs" ("teacher_id", "program_id")
SELECT DISTINCT "teacher_id", "program_id" FROM "public"."classes" WHERE "teacher_id" IS NOT NULL
ON CONFLICT DO NOTHING;

-- AlterTable: hours are now recorded per program; class becomes optional
ALTER TABLE "public"."time_entries" ADD COLUMN "program_id" TEXT;

UPDATE "public"."time_entries" te
SET "program_id" = c."program_id"
FROM "public"."classes" c
WHERE te."class_id" = c."id";

ALTER TABLE "public"."time_entries" ALTER COLUMN "program_id" SET NOT NULL;
ALTER TABLE "public"."time_entries" ALTER COLUMN "class_id" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "time_entries_program_id_idx" ON "public"."time_entries"("program_id");

-- AddForeignKey
ALTER TABLE "public"."time_entries" ADD CONSTRAINT "time_entries_program_id_fkey" FOREIGN KEY ("program_id") REFERENCES "public"."programs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
