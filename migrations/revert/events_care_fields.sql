ALTER TABLE events
  DROP COLUMN IF EXISTS is_care,
  DROP COLUMN IF EXISTS reminder_interval_days;
