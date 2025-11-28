-- PostgreSQL schema for bookings
CREATE TABLE IF NOT EXISTS bookings (
  id SERIAL PRIMARY KEY,
  firstname TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  company TEXT,
  freelancer TEXT,
  date DATE NOT NULL,
  time TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
