-- Create users table
CREATE TABLE IF NOT EXISTS habit.users (
    google_user_id VARCHAR(255) PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    picture_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add Google ID column to users table
ALTER TABLE habit.users 
ADD COLUMN google_id VARCHAR(255) UNIQUE;

-- Update existing columns in users table
ALTER TABLE habit.users
ALTER COLUMN email SET NOT NULL,
ALTER COLUMN name TYPE VARCHAR(255),
ALTER COLUMN picture_url TYPE TEXT,
ALTER COLUMN created_at SET DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN last_updated SET DEFAULT CURRENT_TIMESTAMP;

-- Add user_id column to habit_log table
ALTER TABLE habit.habit_log 
ADD COLUMN user_id INTEGER NOT NULL DEFAULT 1;

-- Add user_id column to alcohol table
ALTER TABLE habit.alcohol 
ADD COLUMN user_id INTEGER NOT NULL DEFAULT 1;

-- Add user_id column to exercise table
ALTER TABLE habit.exercise 
ADD COLUMN user_id INTEGER NOT NULL DEFAULT 1;

-- Add indexes for better query performance
CREATE INDEX idx_habit_log_user_id ON habit.habit_log(user_id);
CREATE INDEX idx_alcohol_user_id ON habit.alcohol(user_id);
CREATE INDEX idx_exercise_user_id ON habit.exercise(user_id);

-- Add foreign key constraints to ensure data integrity
ALTER TABLE habit.habit_log
ADD CONSTRAINT fk_habit_log_user_id
FOREIGN KEY (user_id) REFERENCES habit.users(user_id);

ALTER TABLE habit.alcohol
ADD CONSTRAINT fk_alcohol_user_id
FOREIGN KEY (user_id) REFERENCES habit.users(user_id);

ALTER TABLE habit.exercise
ADD CONSTRAINT fk_exercise_user_id
FOREIGN KEY (user_id) REFERENCES habit.users(user_id); 