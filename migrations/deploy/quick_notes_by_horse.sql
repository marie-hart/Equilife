BEGIN;

ALTER TABLE quick_notes
    ADD COLUMN IF NOT EXISTS horse_id UUID REFERENCES horses(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_quick_notes_horse_id ON quick_notes(horse_id);

COMMIT;
