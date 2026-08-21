ALTER TABLE "public"."teachers"
DROP COLUMN "zelle_id",
DROP COLUMN "hourly_rate";

DROP TABLE "public"."payroll_entries";

DROP TABLE "public"."payroll_periods";

DROP TYPE "public"."PayrollStatus";
