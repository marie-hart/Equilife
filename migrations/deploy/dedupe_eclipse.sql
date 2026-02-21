-- Dédupliquer les chevaux "Eclipse" (garde le plus ancien)
DO $$
DECLARE
  keep_id UUID;
  eclipse_ids UUID[];
BEGIN
  SELECT ARRAY_AGG(id)
  INTO eclipse_ids
  FROM horses
  WHERE LOWER(name) = LOWER('Eclipse');

  IF eclipse_ids IS NULL OR ARRAY_LENGTH(eclipse_ids, 1) < 2 THEN
    RETURN;
  END IF;

  SELECT id INTO keep_id
  FROM horses
  WHERE LOWER(name) = LOWER('Eclipse')
  ORDER BY created_at ASC
  LIMIT 1;

  -- Prévenir les conflits sur la table de liaison
  DELETE FROM product_horses mh
  USING product_horses mk
  WHERE mk.product_id = mh.product_id
    AND mk.horse_id = keep_id
    AND mh.horse_id <> keep_id
    AND mh.horse_id = ANY(eclipse_ids);

  UPDATE events SET horse_id = keep_id
  WHERE horse_id = ANY(eclipse_ids) AND horse_id <> keep_id;

  UPDATE documents SET horse_id = keep_id
  WHERE horse_id = ANY(eclipse_ids) AND horse_id <> keep_id;

  UPDATE rations SET horse_id = keep_id
  WHERE horse_id = ANY(eclipse_ids) AND horse_id <> keep_id;

  UPDATE product SET horse_id = keep_id
  WHERE horse_id = ANY(eclipse_ids) AND horse_id <> keep_id;

  UPDATE product_horses SET horse_id = keep_id
  WHERE horse_id = ANY(eclipse_ids) AND horse_id <> keep_id;

  DELETE FROM horses
  WHERE id = ANY(eclipse_ids) AND id <> keep_id;
END $$;
