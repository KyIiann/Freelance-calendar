#!/usr/bin/env node
import dotenv from 'dotenv'
import { Client } from 'pg'
import bcrypt from 'bcrypt'

dotenv.config()

function parseArgs() {
  const args = process.argv.slice(2)
  const out = {}
  for (let i = 0; i < args.length; i++) {
    const a = args[i]
    if (a.startsWith('--')) {
      const key = a.replace(/^--/, '')
      const val = args[i + 1]
      out[key] = val
      i++
    }
  }
  return out
}

async function main() {
  const { email, password, name, role } = parseArgs()
  if (!email || !password) {
    console.error('Usage: create-admin.js --email <email> --password <password> [--name <name>] [--role admin]')
    process.exit(2)
  }
  const DATABASE_URL = process.env.DATABASE_URL
  if (!DATABASE_URL) {
    console.error('DATABASE_URL not set in .env')
    process.exit(3)
  }
  const client = new Client({ connectionString: DATABASE_URL })
  await client.connect()
  try {
    const password_hash = await bcrypt.hash(password, 10)
    const r = await client.query('INSERT INTO users (email, password_hash, name, role) VALUES ($1,$2,$3,$4) RETURNING id, email, name, role', [email, password_hash, name || null, role || 'admin'])
    console.log('Admin user created:', r.rows[0])
  } catch (e) {
    console.error('Failed to create user:', e.message)
  } finally {
    await client.end()
  }
}

main().catch(e => { console.error(e); process.exit(1) })
