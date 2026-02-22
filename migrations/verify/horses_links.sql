BEGIN;
SELECT next_reminder_date, last_reminder_date FROM events WHERE FALSE;
ROLLBACK;