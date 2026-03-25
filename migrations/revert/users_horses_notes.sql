BEGIN;
DROP TRIGGER IF EXISTS update_quick_notes_updated_at ON quick_notes;
DROP TABLE IF EXISTS quick_notes;
DROP INDEX IF EXISTS idx_horses_user_id;
ALTER TABLE horses DROP COLUMN IF EXISTS user_id;
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
DROP TABLE IF EXISTS users;
COMMIT;
