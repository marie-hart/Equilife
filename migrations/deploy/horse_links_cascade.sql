-- Convert horse links to ON DELETE CASCADE
DO $$
DECLARE
  constraint_name text;
BEGIN
  SELECT tc.constraint_name
  INTO constraint_name
  FROM information_schema.table_constraints tc
  JOIN information_schema.key_column_usage kcu
    ON tc.constraint_name = kcu.constraint_name
   AND tc.table_schema = kcu.table_schema
  JOIN information_schema.constraint_column_usage ccu
    ON ccu.constraint_name = tc.constraint_name
   AND ccu.table_schema = tc.table_schema
  WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_name = 'events'
    AND kcu.column_name = 'horse_id'
    AND ccu.table_name = 'horses';

  IF constraint_name IS NOT NULL THEN
    EXECUTE format('ALTER TABLE events DROP CONSTRAINT %I', constraint_name);
  END IF;

  ALTER TABLE events
    ADD CONSTRAINT events_horse_id_fkey
    FOREIGN KEY (horse_id)
    REFERENCES horses(id)
    ON DELETE CASCADE;
END $$;

DO $$
DECLARE
  constraint_name text;
BEGIN
  SELECT tc.constraint_name
  INTO constraint_name
  FROM information_schema.table_constraints tc
  JOIN information_schema.key_column_usage kcu
    ON tc.constraint_name = kcu.constraint_name
   AND tc.table_schema = kcu.table_schema
  JOIN information_schema.constraint_column_usage ccu
    ON ccu.constraint_name = tc.constraint_name
   AND ccu.table_schema = tc.table_schema
  WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_name = 'materials'
    AND kcu.column_name = 'horse_id'
    AND ccu.table_name = 'horses';

  IF constraint_name IS NOT NULL THEN
    EXECUTE format('ALTER TABLE materials DROP CONSTRAINT %I', constraint_name);
  END IF;

  ALTER TABLE materials
    ADD CONSTRAINT materials_horse_id_fkey
    FOREIGN KEY (horse_id)
    REFERENCES horses(id)
    ON DELETE CASCADE;
END $$;
