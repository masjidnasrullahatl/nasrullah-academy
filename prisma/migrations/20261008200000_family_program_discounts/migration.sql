-- AlterTable: optional monthly tuition discount per family program
ALTER TABLE "public"."family_programs"
ADD COLUMN "discount" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN "discount_note" TEXT;
