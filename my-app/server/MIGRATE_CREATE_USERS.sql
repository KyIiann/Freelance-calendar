-- create admin users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT,
  role TEXT DEFAULT 'admin',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- grant basic index
CREATE INDEX IF NOT EXISTS users_email_idx ON users (email);
