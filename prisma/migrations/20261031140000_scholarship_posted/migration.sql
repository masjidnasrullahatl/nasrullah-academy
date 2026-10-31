-- AddColumn: what a scholarship added to Monthly Payments, so it can be undone
ALTER TABLE "public"."scholarships" ADD COLUMN "posted_invoice_id" TEXT;
ALTER TABLE "public"."scholarships" ADD COLUMN "posted_amount" DECIMAL(10,2);
ALTER TABLE "public"."scholarships" ADD COLUMN "posted_note" TEXT;
