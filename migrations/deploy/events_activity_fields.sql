-- Ajout des champs pour le journal d'activités
ALTER TABLE events
  ADD COLUMN activity_type VARCHAR(40),
  ADD COLUMN activity_duration_minutes INTEGER,
  ADD COLUMN activity_intensity VARCHAR(20),
  ADD COLUMN activity_comment TEXT;

ALTER TABLE events
  ADD CONSTRAINT events_activity_intensity_check
  CHECK (activity_intensity IN ('legere', 'normale', 'soutenue') OR activity_intensity IS NULL);
