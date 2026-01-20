-- Seed de démonstration pour le cheval "Eclipse"
DO $$
DECLARE
  eclipse_id UUID;
  mat_aliment_id UUID;
  mat_complement_id UUID;
  mat_soin_id UUID;
  mat_materiel_id UUID;
  mat_autres_id UUID;
  v_ration_id UUID;
BEGIN
  -- Cheval Eclipse
  SELECT id INTO eclipse_id
  FROM horses
  WHERE name = 'Eclipse'
  ORDER BY created_at ASC
  LIMIT 1;

  IF eclipse_id IS NULL THEN
    INSERT INTO horses (name, breed, birth_date, additional_info)
    VALUES ('Eclipse', 'Selle Français', '2015-04-12', 'demo_seed')
    RETURNING id INTO eclipse_id;
  ELSE
    UPDATE horses
    SET additional_info = 'demo_seed'
    WHERE id = eclipse_id;
  END IF;

  -- Produits
  INSERT INTO materials (
    name, description, category, brand, note, needs_repurchase,
    last_purchase_date, purchase_interval_months
  )
  VALUES (
    'Granulés Performance', 'Aliment énergie', 'Aliment', 'EquiFeed', 'demo_seed', true,
    CURRENT_DATE - INTERVAL '40 days', 1
  )
  ON CONFLICT (LOWER(name)) DO UPDATE SET name = EXCLUDED.name
  RETURNING id INTO mat_aliment_id;

  INSERT INTO materials (
    name, description, category, brand, note
  )
  VALUES (
    'Complément Omega 3', 'Complément peau et robe', 'Complément', 'NutriHorse', 'demo_seed'
  )
  ON CONFLICT (LOWER(name)) DO UPDATE SET name = EXCLUDED.name
  RETURNING id INTO mat_complement_id;

  INSERT INTO materials (
    name, description, category, brand, note
  )
  VALUES (
    'Gel Arnika', 'Soin musculaire', 'Soin', 'EquiCare', 'demo_seed'
  )
  ON CONFLICT (LOWER(name)) DO UPDATE SET name = EXCLUDED.name
  RETURNING id INTO mat_soin_id;

  INSERT INTO materials (
    name, description, category, brand, note, needs_repurchase
  )
  VALUES (
    'Brosse douce', 'Matériel pansage', 'Matériels', 'StablePro', 'demo_seed', false
  )
  ON CONFLICT (LOWER(name)) DO UPDATE SET name = EXCLUDED.name
  RETURNING id INTO mat_materiel_id;

  INSERT INTO materials (
    name, description, category, brand, note
  )
  VALUES (
    'Seau 12L', 'Divers', 'Autres', 'BarnTools', 'demo_seed'
  )
  ON CONFLICT (LOWER(name)) DO UPDATE SET name = EXCLUDED.name
  RETURNING id INTO mat_autres_id;

  -- Lien produits <-> cheval
  INSERT INTO material_horses (material_id, horse_id)
  VALUES (mat_aliment_id, eclipse_id)
  ON CONFLICT DO NOTHING;

  INSERT INTO material_horses (material_id, horse_id)
  VALUES (mat_complement_id, eclipse_id)
  ON CONFLICT DO NOTHING;

  INSERT INTO material_horses (material_id, horse_id)
  VALUES (mat_soin_id, eclipse_id)
  ON CONFLICT DO NOTHING;

  -- Ration
  SELECT id INTO v_ration_id
  FROM rations
  WHERE horse_id = eclipse_id AND name = 'Ration hiver'
  LIMIT 1;

  IF v_ration_id IS NULL THEN
    INSERT INTO rations (horse_id, name, start_date, end_date, note, is_active)
    VALUES (eclipse_id, 'Ration hiver', CURRENT_DATE - INTERVAL '30 days', NULL, 'demo_seed', true)
    RETURNING id INTO v_ration_id;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM ration_items
    WHERE ration_id = v_ration_id AND product_id = mat_aliment_id AND type = 'aliment'
  ) THEN
    INSERT INTO ration_items (ration_id, product_id, quantity, frequency, type)
    VALUES (v_ration_id, mat_aliment_id, '2 L', ARRAY['matin', 'soir'], 'aliment');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM ration_items
    WHERE ration_id = v_ration_id AND product_id = mat_complement_id AND type = 'complement'
  ) THEN
    INSERT INTO ration_items (ration_id, product_id, quantity, frequency, type)
    VALUES (v_ration_id, mat_complement_id, '1 mesure', ARRAY['soir'], 'complement');
  END IF;

  -- Activités
  IF NOT EXISTS (
    SELECT 1 FROM events
    WHERE horse_id = eclipse_id AND name = 'Balade en extérieur'
  ) THEN
    INSERT INTO events (
      name, description, event_date, horse_id, is_care, reminder_type,
      activity_type, activity_duration_minutes, activity_intensity, activity_comment,
      reminder_enabled
    ) VALUES (
      'Balade en extérieur', 'Sortie en forêt', CURRENT_DATE - INTERVAL '7 days', eclipse_id,
      false, 'activité', 'balade', 60, 'normale', 'Cheval très calme', false
    );
  END IF;

  -- Soins (avec produit)
  IF NOT EXISTS (
    SELECT 1 FROM events
    WHERE horse_id = eclipse_id AND name = 'Ostéo'
  ) THEN
    INSERT INTO events (
      name, description, event_date, horse_id, product_id, is_care, reminder_type,
      reminder_enabled, reminder_interval_months
    ) VALUES (
      'Ostéo', 'Séance de contrôle', CURRENT_DATE + INTERVAL '5 days', eclipse_id, mat_soin_id,
      true, 'soin', true, 6
    );
  END IF;

  -- Rappel alimentation
  IF NOT EXISTS (
    SELECT 1 FROM events
    WHERE horse_id = eclipse_id AND name = 'Commander les granulés'
  ) THEN
    INSERT INTO events (
      name, description, event_date, horse_id, is_care, reminder_type,
      reminder_enabled, reminder_interval_months
    ) VALUES (
      'Commander les granulés', 'Stock faible', CURRENT_DATE + INTERVAL '3 days', eclipse_id,
      false, 'alimentation', true, 1
    );
  END IF;

  -- Documents
  IF NOT EXISTS (
    SELECT 1 FROM documents
    WHERE horse_id = eclipse_id AND title = 'Certificat vétérinaire'
  ) THEN
    INSERT INTO documents (
      horse_id, title, document_date, tag, file_path, note
    ) VALUES (
      eclipse_id, 'Certificat vétérinaire', CURRENT_DATE - INTERVAL '20 days',
      'certificats', '/uploads/documents/demo.pdf', 'demo_seed'
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM documents
    WHERE horse_id = eclipse_id AND title = 'Facture maréchal'
  ) THEN
    INSERT INTO documents (
      horse_id, title, document_date, tag, file_path, note
    ) VALUES (
      eclipse_id, 'Facture maréchal', CURRENT_DATE - INTERVAL '10 days',
      'factures', '/uploads/documents/demo.jpg', 'demo_seed'
    );
  END IF;
END $$;
