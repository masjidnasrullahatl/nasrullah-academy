ALTER TABLE "public"."classes" DROP CONSTRAINT "classes_program_id_fkey";
ALTER TABLE "public"."enrollments" DROP CONSTRAINT "enrollments_program_id_fkey";
ALTER TABLE "public"."monthly_invoices" DROP CONSTRAINT "monthly_invoices_program_id_fkey";

DROP INDEX "public"."classes_name_program_id_school_year_key";
DROP INDEX "public"."monthly_invoices_year_month_program_id_idx";
DROP INDEX "public"."monthly_invoices_family_id_program_id_year_month_key";

ALTER TABLE "public"."classes"
  DROP COLUMN "program_id",
  DROP COLUMN "session",
  DROP COLUMN "school_year",
  DROP COLUMN "room",
  DROP COLUMN "capacity";

ALTER TABLE "public"."enrollments" DROP COLUMN "program_id";
ALTER TABLE "public"."monthly_invoices" DROP COLUMN "program_id";

DROP TABLE "public"."programs";
DROP TYPE "public"."ProgramCode";

CREATE UNIQUE INDEX "classes_name_key" ON "public"."classes"("name");
CREATE UNIQUE INDEX "monthly_invoices_family_id_year_month_key" ON "public"."monthly_invoices"("family_id", "year", "month");
CREATE INDEX "monthly_invoices_year_month_idx" ON "public"."monthly_invoices"("year", "month");
