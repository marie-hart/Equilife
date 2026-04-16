BEGIN;

CREATE TABLE IF NOT EXISTS care_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(160) NOT NULL,
    category VARCHAR(120) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_care_types_user_id ON care_types(user_id);

CREATE UNIQUE INDEX IF NOT EXISTS idx_care_types_user_name_lower
    ON care_types(user_id, LOWER(name));

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_trigger
        WHERE tgname = 'update_care_types_updated_at'
    ) THEN
        CREATE TRIGGER update_care_types_updated_at
            BEFORE UPDATE ON care_types
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

COMMIT;
