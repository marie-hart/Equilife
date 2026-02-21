-- Vérifier que les tables existent
DO $ $ BEGIN IF NOT EXISTS (
    SELECT
        1
    FROM
        information_schema.tables
    WHERE
        table_name = 'events'
) THEN RAISE EXCEPTION 'Table events does not exist';

END IF;

IF NOT EXISTS (
    SELECT
        1
    FROM
        information_schema.tables
    WHERE
        table_name = 'products'
) THEN RAISE EXCEPTION 'Table products does not exist';

END IF;

-- Vérifier que les fonctions existent
IF NOT EXISTS (
    SELECT
        1
    FROM
        pg_proc
    WHERE
        proname = 'update_updated_at_column'
) THEN RAISE EXCEPTION 'Function update_updated_at_column does not exist';

END IF;

END $ $;