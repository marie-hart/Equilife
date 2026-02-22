BEGIN;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE OR REPLACE FUNCTION update_updated_at_column() RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION calculate_age(birth_date DATE)
RETURNS INTEGER AS $$
BEGIN
    IF birth_date IS NULL THEN RETURN NULL; END IF;
    RETURN EXTRACT(YEAR FROM age(birth_date));
END;
$$ LANGUAGE plpgsql;

CREATE TABLE horses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    sex VARCHAR(20) CHECK (sex IN ('Jument', 'Hongre', 'Etalon')),
    breed VARCHAR(255),
    coat VARCHAR(50),
    birth_date DATE,
    stable_location VARCHAR(255),
    feed TEXT,
    additional_info TEXT,
    photo_path VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    brand VARCHAR(80),
    category VARCHAR(30) NOT NULL CHECK (category IN ('Granulés', 'Complément', 'Friandises', 'Équipement', 'Pharmacie', 'Autres')),
    note TEXT,
    purchase_date DATE,
    last_purchase_date DATE,
    quantity_purchased DECIMAL(10, 2),
    daily_usage DECIMAL(10, 2),
    unit VARCHAR(10) CHECK (unit IN ('kg', 'g', 'L')),
    needs_repurchase BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Ancien fichier products_unique_name fusionné ici
CREATE UNIQUE INDEX products_name_unique ON products (LOWER(name));

-- Table de liaison indispensable pour ton seed
CREATE TABLE product_horses (
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    horse_id UUID REFERENCES horses(id) ON DELETE CASCADE,
    PRIMARY KEY (product_id, horse_id)
);

CREATE TRIGGER update_horses_updated_at BEFORE UPDATE ON horses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
COMMIT;