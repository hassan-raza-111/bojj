-- Add missing fields to vendor_profiles table
ALTER TABLE "public"."vendor_profiles" ADD COLUMN "description" TEXT;
ALTER TABLE "public"."vendor_profiles" ADD COLUMN "hourlyRate" DOUBLE PRECISION;
