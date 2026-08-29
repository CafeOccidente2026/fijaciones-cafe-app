/*
  Warnings:

  - Added the required column `audience` to the `notifications` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "NotificationAudience" AS ENUM ('ALL_PRODUCER', 'ALL_PRICE_MANAGER', 'SPECIFIC');

-- AlterTable
ALTER TABLE "notifications" ADD COLUMN     "audience" "NotificationAudience";

-- Backfill: existing rows predate the audience field, so we can't know
-- which one they were. SPECIFIC is the safe default (it just means the
-- historical recipient list stays exactly as it already is).
UPDATE "notifications" SET "audience" = 'SPECIFIC' WHERE "audience" IS NULL;

ALTER TABLE "notifications" ALTER COLUMN "audience" SET NOT NULL;
