-- AddColumn
ALTER TABLE "public"."family_subscriptions" ADD COLUMN "is_payer" BOOLEAN NOT NULL DEFAULT true;
