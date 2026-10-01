-- CreateTable
CREATE TABLE "public"."family_programs" (
    "family_id" TEXT NOT NULL,
    "program_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "family_programs_pkey" PRIMARY KEY ("family_id","program_id")
);

-- CreateIndex
CREATE INDEX "family_programs_program_id_idx" ON "public"."family_programs"("program_id");

-- AddForeignKey
ALTER TABLE "public"."family_programs" ADD CONSTRAINT "family_programs_family_id_fkey" FOREIGN KEY ("family_id") REFERENCES "public"."families"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."family_programs" ADD CONSTRAINT "family_programs_program_id_fkey" FOREIGN KEY ("program_id") REFERENCES "public"."programs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Enable RLS for new table
ALTER TABLE "public"."family_programs" ENABLE ROW LEVEL SECURITY;

-- Revoke privileges for anon/authenticated on new table
REVOKE ALL ON "public"."family_programs" FROM anon, authenticated;
