import express from 'express'
import { db } from '../db.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { requireAdmin } from '../middlewares/auth.js'

const router = express.Router()

// create a new admin user (protected by legacy ADMIN_KEY)
router.post('/users', requireAdmin, async (req, res) => {
  const { email, password, name, role } = req.body
  if (!email || !password) return res.status(400).json({ error: 'email & password are required' })
  try {
    const password_hash = await bcrypt.hash(password, 10)
    const { rows } = await db.query('INSERT INTO users (email, password_hash, name, role) VALUES ($1,$2,$3,$4) RETURNING id, email, name, role, created_at', [email, password_hash, name || null, role || 'admin'])
    res.json(rows[0])
  } catch (e) { res.status(500).json({ error: e.message }) }
})

// admin login -> returns JWT
router.post('/login', async (req, res) => {
  const { email, password } = req.body
  if (!email || !password) return res.status(400).json({ error: 'email & password required' })
  try {
    const { rows } = await db.query('SELECT id, email, password_hash, name, role FROM users WHERE email = $1', [email])
    if (!rows[0]) return res.status(401).json({ error: 'Invalid credentials' })
    const user = rows[0]
    const ok = await bcrypt.compare(password, user.password_hash)
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' })
    const jwtSecret = process.env.JWT_SECRET
    if (!jwtSecret) return res.status(500).json({ error: 'Server misconfiguration: JWT_SECRET not set' })
    const token = jwt.sign({ id: user.id, email: user.email, name: user.name, role: user.role }, jwtSecret, { expiresIn: '8h' })
    res.json({ token, id: user.id, email: user.email, name: user.name, role: user.role })
  } catch (e) { res.status(500).json({ error: e.message }) }
})

// check who is logged in (token introspection)
router.get('/me', requireAdmin, async (req, res) => {
  if (!req.user) return res.status(401).json({ error: 'Not authenticated' })
  res.json({ user: req.user })
})

export default router
