-- Ajout du type de rappel
ALTER TABLE events
  ADD COLUMN reminder_type VARCHAR(20) DEFAULT 'autres';

ALTER TABLE events
  ADD CONSTRAINT events_reminder_type_check
  CHECK (reminder_type IN ('soin', 'activité', 'alimentation', 'autres') OR reminder_type IS NULL);
