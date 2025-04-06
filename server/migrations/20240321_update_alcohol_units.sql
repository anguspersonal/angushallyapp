-- Drop the existing generated column
ALTER TABLE habit.alcohol DROP COLUMN units;

-- Add the new generated column with the correct calculation
ALTER TABLE habit.alcohol ADD COLUMN units double precision GENERATED ALWAYS AS (
    (abv_percent * volume_ml * count) / (1000)::double precision
) STORED; 