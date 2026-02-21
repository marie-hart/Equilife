-- Seed de démonstration pour le cheval "Eclipse"
BEGIN;

DO $$
DECLARE
  eclipse_id UUID;
  prod_aliment_id UUID;
  prod_complement_id UUID;
  prod_soin_id UUID;
  prod_equipement_id UUID;
  prod_autres_id UUID;
  v_ration_id UUID;
BEGIN
  -- 1. Récupération ou création du cheval Eclipse
  SELECT id INTO eclipse_id FROM horses WHERE name = 'Eclipse' LIMIT 1;

  IF eclipse_id IS NULL THEN
    INSERT INTO horses (name, breed, birth_date, additional_info)
    VALUES ('Eclipse', 'Selle Français', '2015-04-12', 'demo_seed')
    RETURNING id INTO eclipse_id;
  END IF;

  -- 2. Insertion des Produits (Respectant les catégories TypeScript)
  -- Granulés
  INSERT INTO products (name, category, brand, note, quantity_purchased, unit, daily_usage, needs_repurchase, purchase_date)
  VALUES ('Granulés Performance', 'Granulés', 'EquiFeed', 'demo_seed', 25.0, 'kg', 2.0, true, CURRENT_DATE - INTERVAL '40 days')
  RETURNING id INTO prod_aliment_id;

  -- Complément
  INSERT INTO products (name, category, brand, note, quantity_purchased, unit, daily_usage)
  VALUES ('Complément Omega 3', 'Complément', 'NutriHorse', 'demo_seed', 1000, 'g', 50)
  RETURNING id INTO prod_complement_id;

  -- Pharmacie / Soin
  INSERT INTO products (name, category, brand, note)
  VALUES ('Gel Arnika', 'Pharmacie', 'EquiCare', 'demo_seed')
  RETURNING id INTO prod_soin_id;

  -- Équipement
  INSERT INTO products (name, category, brand, note, needs_repurchase)
  VALUES ('Brosse douce', 'Équipement', 'StablePro', 'demo_seed', false)
  RETURNING id INTO prod_equipement_id;

  -- Autres
  INSERT INTO products (name, category, brand, note)
  VALUES ('Seau 12L', 'Autres', 'BarnTools', 'demo_seed')
  RETURNING id INTO prod_autres_id;

  -- 3. Lien produits <-> cheval (Table de liaison product_horses)
  INSERT INTO product_horses (product_id, horse_id)
  VALUES 
    (prod_aliment_id, eclipse_id),
    (prod_complement_id, eclipse_id),
    (prod_soin_id, eclipse_id)
  ON CONFLICT DO NOTHING;

  -- 4. Ration
  SELECT id INTO v_ration_id FROM rations WHERE horse_id = eclipse_id AND name = 'Ration hiver' LIMIT 1;

  IF v_ration_id IS NULL THEN
    INSERT INTO rations (horse_id, name, start_date, is_active)
    VALUES (eclipse_id, 'Ration hiver', CURRENT_DATE - INTERVAL '30 days', true)
    RETURNING id INTO v_ration_id;
  END IF;

  -- Items de la ration (Lien vers products)
  INSERT INTO ration_items (ration_id, product_id, quantity, frequency, type)
  VALUES 
    (v_ration_id, prod_aliment_id, '2', ARRAY['Matin', 'Soir'], 'aliment'),
    (v_ration_id, prod_complement_id, '1', ARRAY['Soir'], 'complement')
  ON CONFLICT DO NOTHING;

  -- 5. Événements / Soins
  -- Activité Simple
  INSERT INTO events (name, description, event_date, horse_id, reminder_enabled)
  VALUES ('Balade en extérieur', 'Sortie en forêt', CURRENT_DATE - INTERVAL '7 days', eclipse_id, false);

  -- Soin lié à un produit (ex: Gel Arnika utilisé)
  INSERT INTO events (name, description, event_date, horse_id, product_id, reminder_enabled, reminder_interval_months)
  VALUES ('Soin musculaire', 'Application gel après séance', CURRENT_DATE, eclipse_id, prod_soin_id, true, 1);

  -- 6. Documents (Vérifiez que votre table documents existe déjà)
  -- Si elle n'existe pas encore dans vos fichiers précédents, cette partie pourra être commentée.
  INSERT INTO documents (horse_id, title, document_date, tag, file_path, note)
  VALUES 
    (eclipse_id, 'Certificat vétérinaire', CURRENT_DATE - INTERVAL '20 days', 'certificats', '/uploads/demo.pdf', 'demo_seed'),
    (eclipse_id, 'Facture maréchal', CURRENT_DATE - INTERVAL '10 days', 'factures', '/uploads/demo.jpg', 'demo_seed')
  ON CONFLICT DO NOTHING;

END $$;

COMMIT;