-- Table des chevaux
CREATE TABLE horses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    breed VARCHAR(255),
    birth_date DATE,
    additional_info TEXT,
    photo_path VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Fonction pour calculer l'âge à partir de la date de naissance
CREATE OR REPLACE FUNCTION calculate_age(birth_date DATE) 
RETURNS INTEGER AS $$
BEGIN
    IF birth_date IS NULL THEN
        RETURN NULL;
    END IF;
    RETURN EXTRACT(YEAR FROM age(birth_date));
END;
$$ LANGUAGE plpgsql;

-- Fonction pour mettre à jour updated_at automatiquement (si absente)
CREATE OR REPLACE FUNCTION update_updated_at_column() RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour mettre à jour updated_at
CREATE TRIGGER update_horses_updated_at BEFORE
UPDATE
    ON horses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Index pour améliorer les performances
CREATE INDEX idx_horses_name ON horses(name);
