-- Extension pour générer des UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table des événements (dentiste, parage, etc.)
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    event_date DATE NOT NULL,
    reminder_enabled BOOLEAN DEFAULT false,
    reminder_interval_months INTEGER,
    reminder_interval_years INTEGER,
    last_reminder_date DATE,
    next_reminder_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table du matériel à acheter régulièrement
CREATE TABLE materials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    last_purchase_date DATE,
    purchase_interval_months INTEGER,
    purchase_interval_years INTEGER,
    estimated_cost DECIMAL(10, 2),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index pour améliorer les performances
CREATE INDEX idx_events_event_date ON events(event_date);

CREATE INDEX idx_events_next_reminder_date ON events(next_reminder_date);

CREATE INDEX idx_materials_last_purchase_date ON materials(last_purchase_date);

CREATE INDEX idx_materials_is_active ON materials(is_active);

-- Fonction pour mettre à jour updated_at automatiquement
CREATE
OR REPLACE FUNCTION update_updated_at_column() RETURNS TRIGGER AS $ $ BEGIN NEW.updated_at = CURRENT_TIMESTAMP;

RETURN NEW;

END;

$ $ LANGUAGE plpgsql;

-- Triggers pour mettre à jour updated_at
CREATE TRIGGER update_events_updated_at BEFORE
UPDATE
    ON events FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_materials_updated_at BEFORE
UPDATE
    ON materials FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();