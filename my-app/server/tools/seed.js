#!/usr/bin/env node
import dotenv from 'dotenv'
import { Client } from 'pg'
import bcrypt from 'bcrypt'
import crypto from 'crypto'

dotenv.config()

async function main() {
  const DATABASE_URL = process.env.DATABASE_URL
  if (!DATABASE_URL) {
    console.error('DATABASE_URL not set in .env')
    process.exit(3)
  }
  const client = new Client({ connectionString: DATABASE_URL })
  await client.connect()
  try {
    // Seed freelancers
    const freelancers = [
      { name: 'Marie Dupont', role: 'Designer', email: 'marie@example.com', avatar_url: '/assets/avatars/marie.svg', bio: 'UI/UX Designer' },
      { name: 'Jean Petit', role: 'Dev', email: 'jean@example.com', avatar_url: '/assets/avatars/jean.svg', bio: 'Frontend dev' },
      { name: 'Sam Durand', role: 'Consultant', email: 'sam@example.com', avatar_url: '/assets/avatars/sam.svg', bio: 'Product consultant' },
    ]
    for (const f of freelancers) {
      const exists = await client.query('SELECT id FROM freelancers WHERE email = $1', [f.email])
      if (exists.rows.length === 0) {
        await client.query('INSERT INTO freelancers (name, role, bio, avatar_url, email) VALUES ($1,$2,$3,$4,$5)', [f.name, f.role, f.bio, f.avatar_url, f.email])
        console.log('Inserted freelancer', f.email)
      } else console.log('Freelancer exists:', f.email)
    }

    // Create a sample booking for the first freelancer at tomorrow 10:00
    const f = await client.query('SELECT id FROM freelancers ORDER BY id LIMIT 1')
    if (f.rows.length > 0) {
      const freelancerId = f.rows[0].id
      const tomorrow = new Date()
      tomorrow.setUTCDate(tomorrow.getUTCDate() + 1)
      tomorrow.setUTCHours(10, 0, 0, 0)
      const start_ts = tomorrow.toISOString()
      const duration_minutes = 30
      const cancel_token = crypto.randomBytes(12).toString('hex')
      // avoid duplicate booking with same time
      const check = await client.query('SELECT id FROM bookings WHERE freelancer = $1 AND start_ts = $2', [freelancerId, start_ts])
      if (check.rows.length === 0) {
        await client.query('INSERT INTO bookings (freelancer, firstname, email, phone, company, start_ts, duration_minutes, cancel_token) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)', [freelancerId, 'Test User', 'test@example.com', '0123456789', 'ACME', start_ts, duration_minutes, cancel_token])
        console.log('Inserted sample booking for freelancer', freelancerId)
      } else console.log('Sample booking exists for freelancer', freelancerId)
    }

    // Optionally create admin user
    const seedAdminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@example.com'
    const seedAdminPassword = process.env.SEED_ADMIN_PASSWORD || 'changeme'
    const adminExists = await client.query('SELECT id FROM users WHERE email = $1', [seedAdminEmail])
    if (adminExists.rows.length === 0) {
      const password_hash = await bcrypt.hash(seedAdminPassword, 10)
      await client.query('INSERT INTO users (email, password_hash, name, role) VALUES ($1,$2,$3,$4)', [seedAdminEmail, password_hash, 'Admin', 'admin'])
      console.log('Created admin user', seedAdminEmail)
    } else console.log('Admin user exists:', seedAdminEmail)

  } catch (e) {
    console.error('Seed error', e)
  } finally { await client.end() }
}

main().catch(e => { console.error(e); process.exit(1) })
