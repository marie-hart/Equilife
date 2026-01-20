-- Table des documents
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    horse_id UUID NOT NULL REFERENCES horses(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    document_date DATE,
    tag VARCHAR(40),
    file_path VARCHAR(500) NOT NULL,
    note TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Contrainte sur les tags
ALTER TABLE documents
  ADD CONSTRAINT documents_tag_check
  CHECK (tag IN ('carte_immatriculation', 'certificats', 'ordonnances', 'factures', 'assurance', 'autres') OR tag IS NULL);

-- Trigger pour mettre à jour updated_at
CREATE TRIGGER update_documents_updated_at BEFORE
UPDATE
    ON documents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Index pour améliorer les performances
CREATE INDEX idx_documents_horse_id ON documents(horse_id);
CREATE INDEX idx_documents_tag ON documents(tag);
CREATE INDEX idx_documents_date ON documents(document_date);
