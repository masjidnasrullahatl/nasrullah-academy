-- Registrations now match the Create Family form and record the school rules acceptance
ALTER TABLE "public"."registrations"
ADD COLUMN "family_name" TEXT,
ADD COLUMN "father_name" TEXT,
ADD COLUMN "mother_name" TEXT,
ADD COLUMN "rules_accepted_at" TIMESTAMP(3),
ADD COLUMN "rules_signature" TEXT,
ADD COLUMN "rules_version" TEXT;

UPDATE "public"."registrations"
SET "family_name" = trim("parent_first_name" || ' ' || "parent_last_name");

ALTER TABLE "public"."registrations" ALTER COLUMN "family_name" SET NOT NULL;

ALTER TABLE "public"."registrations" DROP COLUMN "parent_first_name";
ALTER TABLE "public"."registrations" DROP COLUMN "parent_last_name";

ALTER TABLE "public"."registrations" RENAME COLUMN "emergency_phone" TO "secondary_phone";
