ALTER TABLE events
  DROP CONSTRAINT IF EXISTS events_reminder_type_check;

ALTER TABLE events
  DROP COLUMN IF EXISTS reminder_type;
