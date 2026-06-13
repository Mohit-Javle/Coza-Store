-- ============================================================
-- COZA STORE — Auto-Cleanup Notifications (Older than 24 Hours)
-- Run this script in the Supabase SQL Editor:
-- https://app.supabase.com/project/vysfftmiwqytwwqzdpvz/sql/new
-- ============================================================

-- 1. Enable the pg_cron extension (default extension in Supabase)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- 2. Safely unschedule any existing cron job with the same name if it exists
SELECT cron.unschedule(jobid)
FROM cron.job
WHERE jobname = 'cleanup-old-notifications';

-- 3. Schedule the cron job
-- This cron job runs every hour (at minute 0) and deletes notification rows
-- that were created more than 24 hours ago.
SELECT cron.schedule(
  'cleanup-old-notifications', -- unique name of the cron job
  '0 * * * *',                 -- cron schedule (every hour at minute 0)
  $$ DELETE FROM public.notifications WHERE created_at < now() - INTERVAL '24 hours'; $$
);

-- 4. (Optional) Run a manual delete right now to clear any current old notifications
DELETE FROM public.notifications WHERE created_at < now() - INTERVAL '24 hours';
