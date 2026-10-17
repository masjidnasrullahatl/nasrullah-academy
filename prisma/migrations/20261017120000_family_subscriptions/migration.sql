-- CreateTable
CREATE TABLE "public"."family_subscriptions" (
    "id" TEXT NOT NULL,
    "family_id" TEXT NOT NULL,
    "program_id" TEXT,
    "stripe_subscription_id" TEXT NOT NULL,
    "keela_recurring_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "family_subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "family_subscriptions_stripe_subscription_id_idx" ON "public"."family_subscriptions"("stripe_subscription_id");

-- CreateIndex
CREATE UNIQUE INDEX "family_subscriptions_family_id_program_id_stripe_subscription_id_key" ON "public"."family_subscriptions"("family_id", "program_id", "stripe_subscription_id");

-- AddForeignKey
ALTER TABLE "public"."family_subscriptions" ADD CONSTRAINT "family_subscriptions_family_id_fkey" FOREIGN KEY ("family_id") REFERENCES "public"."families"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."family_subscriptions" ADD CONSTRAINT "family_subscriptions_program_id_fkey" FOREIGN KEY ("program_id") REFERENCES "public"."programs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Enable RLS for new table
ALTER TABLE "public"."family_subscriptions" ENABLE ROW LEVEL SECURITY;

-- Revoke privileges for anon/authenticated on new table
REVOKE ALL ON "public"."family_subscriptions" FROM anon, authenticated;
