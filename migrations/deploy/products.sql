BEGIN;
-- Table de liaison (Certains produits ne sont que pour certains chevaux)
CREATE TABLE product_horses (
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    horse_id UUID NOT NULL REFERENCES horses(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (product_id, horse_id)
);

CREATE INDEX idx_product_horses_horse_id ON product_horses(horse_id);

COMMIT;