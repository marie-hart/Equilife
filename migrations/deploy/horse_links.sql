-- Ajouter horse_id aux événements et matériels
ALTER TABLE events
  ADD COLUMN IF NOT EXISTS horse_id UUID REFERENCES horses(id) ON DELETE SET NULL;

ALTER TABLE materials
  ADD COLUMN IF NOT EXISTS horse_id UUID REFERENCES horses(id) ON DELETE SET NULL;

-- Index pour les filtres par cheval
CREATE INDEX IF NOT EXISTS idx_events_horse_id ON events(horse_id);
CREATE INDEX IF NOT EXISTS idx_materials_horse_id ON materials(horse_id);
-- Deploy horse_care_db:horse_links to pg

BEGIN;

-- XXX Add DDLs here.

COMMIT;
