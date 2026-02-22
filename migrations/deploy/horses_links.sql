BEGIN;
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    horse_id UUID NOT NULL REFERENCES horses(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    event_date DATE NOT NULL,
    
    -- Champs Rappels (Vérifie que ceux-ci sont bien là)
    reminder_enabled BOOLEAN DEFAULT false,
    reminder_type VARCHAR(20) DEFAULT 'autres' CHECK (reminder_type IN ('soin', 'activité', 'alimentation', 'autres')),
    reminder_interval_days INTEGER,
    reminder_interval_months INTEGER,
    reminder_interval_years INTEGER,
    
    -- AJOUTE CES DEUX LIGNES :
    last_reminder_date DATE,
    next_reminder_date DATE,
    
    -- Champs Activités
    activity_type VARCHAR(40),
    activity_duration_minutes INTEGER,
    activity_intensity VARCHAR(20) CHECK (activity_intensity IN ('legere', 'normale', 'soutenue')),
    activity_comment TEXT,
    is_care BOOLEAN DEFAULT false,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_events_horse_id ON events(horse_id);
CREATE INDEX idx_events_product_id ON events(product_id);
-- Optionnel : index pour le push service
CREATE INDEX idx_events_next_reminder ON events(next_reminder_date);

CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
COMMIT;