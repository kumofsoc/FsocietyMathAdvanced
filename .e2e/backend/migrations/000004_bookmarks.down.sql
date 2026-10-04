DROP INDEX IF EXISTS saved_theorems_user_created_idx;

ALTER TABLE saved_theorems
    DROP CONSTRAINT IF EXISTS saved_theorems_title_valid,
    DROP CONSTRAINT IF EXISTS saved_theorems_kind_valid,
    DROP CONSTRAINT IF EXISTS saved_theorems_id_key,
    DROP COLUMN IF EXISTS updated_at,
    DROP COLUMN IF EXISTS title,
    DROP COLUMN IF EXISTS kind,
    DROP COLUMN IF EXISTS id;
