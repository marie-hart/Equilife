BEGIN;

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table des événements (soins, dentiste, etc.)
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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table des produits (basée sur vos types TypeScript)
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    brand VARCHAR(80),
    category VARCHAR(30) NOT NULL, -- Granulés, Complément, etc.
    note TEXT,
    purchase_date DATE,
    quantity_purchased DECIMAL(10, 2),
    daily_usage DECIMAL(10, 2),
    unit VARCHAR(5), -- kg, g, L
    needs_repurchase BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT check_category CHECK (category IN ('Granulés', 'Complément', 'Friandises', 'Équipement', 'Pharmacie', 'Autres')),
    CONSTRAINT check_unit CHECK (unit IN ('kg', 'g', 'L'))
);

CREATE INDEX idx_events_event_date ON events(event_date);
CREATE INDEX idx_events_next_reminder_date ON events(next_reminder_date);
CREATE INDEX idx_products_is_active ON products(is_active);

-- Automatisation de updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column() 
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMIT;