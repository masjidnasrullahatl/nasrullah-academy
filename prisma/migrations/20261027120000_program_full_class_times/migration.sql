-- AddColumn
ALTER TABLE "public"."programs" ADD COLUMN "full_class_times" TEXT[] DEFAULT ARRAY[]::TEXT[];
