import express from 'express'
import { db } from '../db.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

const router = express.Router()

// Register a new user (open)
router.post('/register', async (req, res) => {
  const { email, password, name } = req.body
  if (!email || !password) return res.status(400).json({ error: 'email & password required' })
  try {
    const exists = await db.query('SELECT id FROM users WHERE email = $1', [email])
    if (exists.rows.length > 0) return res.status(409).json({ error: 'User already exists' })
    const password_hash = await bcrypt.hash(password, 10)
    const { rows } = await db.query('INSERT INTO users (email, password_hash, name, role) VALUES ($1,$2,$3,$4) RETURNING id, email, name, role', [email, password_hash, name || null, 'user'])
    const jwtSecret = process.env.JWT_SECRET
    if (!jwtSecret) return res.status(500).json({ error: 'Server misconfiguration: JWT_SECRET not set' })
    const token = jwt.sign({ id: rows[0].id, email: rows[0].email, name: rows[0].name, role: rows[0].role }, jwtSecret, { expiresIn: '8h' })
    res.status(201).json({ token, id: rows[0].id, email: rows[0].email, name: rows[0].name, role: rows[0].role })
  } catch (e) { res.status(500).json({ error: e.message }) }
})

// Login for regular users
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

// Me - verify token
router.get('/me', async (req, res) => {
  const auth = req.headers['authorization']
  if (!auth) return res.status(200).json({ user: null })
  const token = auth.startsWith('Bearer ') ? auth.split(' ')[1] : null
  const jwtSecret = process.env.JWT_SECRET
  if (!token || !jwtSecret) return res.status(200).json({ user: null })
  try {
    const payload = jwt.verify(token, jwtSecret)
    res.json({ user: payload })
  } catch (e) { res.status(200).json({ user: null }) }
})

export default router
