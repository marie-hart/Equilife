DO $$
DECLARE
  eclipse_id UUID;
BEGIN
  SELECT id INTO eclipse_id
  FROM horses
  WHERE name = 'Eclipse' AND additional_info = 'demo_seed'
  LIMIT 1;

  IF eclipse_id IS NULL THEN
    RETURN;
  END IF;

  -- Supprimer les données liées
  DELETE FROM ration_items
  WHERE ration_id IN (SELECT id FROM rations WHERE horse_id = eclipse_id);

  DELETE FROM rations WHERE horse_id = eclipse_id;
  DELETE FROM documents WHERE horse_id = eclipse_id AND note = 'demo_seed';
  DELETE FROM events WHERE horse_id = eclipse_id;

  DELETE FROM material_horses WHERE horse_id = eclipse_id;
  DELETE FROM materials WHERE note = 'demo_seed';

  DELETE FROM horses WHERE id = eclipse_id;
END $$;
