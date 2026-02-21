BEGIN;

-- Lien événement -> cheval (un soin est pour un cheval précis)
ALTER TABLE events
  ADD COLUMN horse_id UUID REFERENCES horses(id) ON DELETE CASCADE;

CREATE INDEX idx_events_horse_id ON events(horse_id);

COMMIT;