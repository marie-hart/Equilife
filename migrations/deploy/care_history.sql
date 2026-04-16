BEGIN;
-- Table d'historique des soins validés (au lieu de les supprimer)
CREATE TABLE IF NOT EXISTS care_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    original_event_id UUID REFERENCES events(id) ON DELETE SET NULL,
    horse_id UUID NOT NULL REFERENCES horses(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    event_date DATE NOT NULL,
    care_status VARCHAR(20) NOT NULL DEFAULT 'done' CHECK (care_status IN ('done')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_care_history_horse_id ON care_history(horse_id);
CREATE INDEX IF NOT EXISTS idx_care_history_event_date ON care_history(event_date DESC);
COMMIT;
