ALTER TABLE events
  DROP CONSTRAINT IF EXISTS events_activity_intensity_check;

ALTER TABLE events
  DROP COLUMN IF EXISTS activity_type,
  DROP COLUMN IF EXISTS activity_duration_minutes,
  DROP COLUMN IF EXISTS activity_intensity,
  DROP COLUMN IF EXISTS activity_comment;
