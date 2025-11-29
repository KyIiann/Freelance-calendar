-- New schema with freelancers and detailed bookings
CREATE TABLE IF NOT EXISTS freelancers (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT,
  bio TEXT,
  avatar_url TEXT,
  links JSONB,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS bookings (
  id SERIAL PRIMARY KEY,
  freelancer TEXT,
  firstname TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  company TEXT,
  start_ts TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_minutes INT NOT NULL DEFAULT 30,
  cancel_token TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- create index for overlapping checks
CREATE INDEX IF NOT EXISTS bookings_freelancer_start_idx ON bookings (freelancer, start_ts);
