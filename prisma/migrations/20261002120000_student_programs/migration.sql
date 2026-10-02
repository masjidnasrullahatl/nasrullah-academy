-- CreateTable
CREATE TABLE "public"."student_programs" (
    "student_id" TEXT NOT NULL,
    "program_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "student_programs_pkey" PRIMARY KEY ("student_id","program_id")
);

-- CreateIndex
CREATE INDEX "student_programs_program_id_idx" ON "public"."student_programs"("program_id");

-- AddForeignKey
ALTER TABLE "public"."student_programs" ADD CONSTRAINT "student_programs_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."student_programs" ADD CONSTRAINT "student_programs_program_id_fkey" FOREIGN KEY ("program_id") REFERENCES "public"."programs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Enable RLS for new table
ALTER TABLE "public"."student_programs" ENABLE ROW LEVEL SECURITY;

-- Revoke privileges for anon/authenticated on new table
REVOKE ALL ON "public"."student_programs" FROM anon, authenticated;
