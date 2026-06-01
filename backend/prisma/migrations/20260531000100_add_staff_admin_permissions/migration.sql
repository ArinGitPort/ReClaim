-- CreateEnum
CREATE TYPE "AdminPermission" AS ENUM (
  'DASHBOARD',
  'INVENTORY',
  'REPORTS',
  'CLAIMS',
  'LIVE_MONITOR',
  'SNAPSHOTS',
  'DISMISSED_SNAPSHOTS',
  'HANDOVER_LOG',
  'MATCH_HISTORY',
  'USER_DIRECTORY',
  'DELETED_ITEMS',
  'AUDIT_LOGS',
  'CAMERA_SETTINGS',
  'SYSTEM_SETTINGS'
);

-- AlterTable
ALTER TABLE "User" ADD COLUMN "adminPermissions" "AdminPermission"[] NOT NULL DEFAULT ARRAY[]::"AdminPermission"[];

-- Backfill existing staff with the daily operations permission set.
UPDATE "User"
SET "adminPermissions" = ARRAY[
  'DASHBOARD',
  'INVENTORY',
  'REPORTS',
  'CLAIMS',
  'LIVE_MONITOR',
  'SNAPSHOTS',
  'DISMISSED_SNAPSHOTS',
  'HANDOVER_LOG',
  'MATCH_HISTORY'
]::"AdminPermission"[]
WHERE "role" = 'STAFF';
