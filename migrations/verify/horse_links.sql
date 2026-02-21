BEGIN;

SELECT horse_id FROM events WHERE FALSE;
SELECT product_id, horse_id FROM product_horses WHERE FALSE;

ROLLBACK;