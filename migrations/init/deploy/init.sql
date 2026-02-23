BEGIN;

-- 1. Prérequis
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Fonction partagée pour le timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column() 
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Table HORSES (Complète dès le départ)
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

-- Index et Trigger pour Horses
CREATE INDEX idx_horses_name ON horses(name);
CREATE TRIGGER update_horses_updated_at BEFORE UPDATE ON horses 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TYPE product_category AS ENUM ('Granulés', 'Complément', 'Friandises', 'Équipement', 'Pharmacie', 'Autres');

-- 4. Table PRODUCTS (Indépendante)
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    brand VARCHAR(80),
    category VARCHAR(30) NOT NULL,
    note TEXT,
    last_purchase_date DATE,
    quantity_purchased DECIMAL(10, 2),
    daily_usage DECIMAL(10, 2),
    unit VARCHAR(10),
    needs_repurchase BOOLEAN DEFAULT false,
    category product_category NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT check_unit CHECK (unit IN ('kg', 'g', 'L'))
);

CREATE INDEX idx_products_is_active ON products(is_active);
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMIT;