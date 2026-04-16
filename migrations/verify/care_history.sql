BEGIN;

SELECT original_event_id, horse_id, product_id, name, event_date, care_status
FROM care_history
WHERE FALSE;

ROLLBACK;
