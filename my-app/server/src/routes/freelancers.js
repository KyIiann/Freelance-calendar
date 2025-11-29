import express from 'express'
import { db } from '../db.js'
import { requireAdmin } from '../middlewares/auth.js'
import multer from 'multer'
import path from 'path'
import fs from 'fs'

const router = express.Router()

// simple upload handling using multer + storing on server/public/uploads
const uploadDir = path.join(process.cwd(), 'public', 'uploads')
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true })
const storage = multer.diskStorage({
  destination: function (req, file, cb) { cb(null, uploadDir) },
  filename: function (req, file, cb) {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9)
    cb(null, `${unique}${path.extname(file.originalname)}`)
  }
})
const upload = multer({ storage })

router.get('/', async (req, res) => {
  try {
    const { rows } = await db.query('SELECT id, name, role, bio, avatar_url, links, email, created_at FROM freelancers ORDER BY id')
    res.json(rows)
  } catch (e) { res.status(500).json({ error: e.message }) }
})

router.post('/', requireAdmin, async (req, res) => {
  const { name, role, bio, avatar_url, email, links } = req.body
  if (!name) return res.status(400).json({ error: 'name required' })
  try {
    const { rows } = await db.query('INSERT INTO freelancers (name, role, bio, avatar_url, email, links) VALUES ($1,$2,$3,$4,$5,$6) RETURNING id, name, role, bio, avatar_url, links, email, created_at', [name, role, bio || null, avatar_url || null, email || null, links || null])
    res.json(rows[0])
  } catch (e) { res.status(500).json({ error: e.message }) }
})

router.put('/:id', requireAdmin, async (req, res) => {
  const id = req.params.id
  const { name, role, bio, avatar_url, email, links } = req.body
  try {
    const { rows } = await db.query('UPDATE freelancers SET name=$1, role=$2, bio=$3, avatar_url=$4, email=$5, links=$6 WHERE id=$7 RETURNING id, name, role, bio, avatar_url, links, email, created_at', [name, role, bio || null, avatar_url || null, email || null, links || null, id])
    res.json(rows[0])
  } catch (e) { res.status(500).json({ error: e.message }) }
})

router.delete('/:id', requireAdmin, async (req, res) => {
  const id = req.params.id
  try { await db.query('DELETE FROM freelancers WHERE id = $1', [id]); res.json({ success: true }) } catch (e) { res.status(500).json({ error: e.message }) }
})

router.post('/upload', requireAdmin, upload.single('avatar'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'file required' })
  const url = `/uploads/${req.file.filename}`
  res.json({ url })
})

export default router
