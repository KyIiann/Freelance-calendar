import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
dotenv.config()

export function requireAdmin(req, res, next) {
  const adminKey = process.env.ADMIN_KEY
  const jwtSecret = process.env.JWT_SECRET
  // accept bearer token for JWT auth, or a legacy ADMIN_KEY in x-admin-key
  const authHeader = req.headers['authorization'] || req.headers['x-admin-key']
  if (!authHeader) return res.status(401).json({ error: 'Unauthorized' })
  // If provided as raw admin key header
  if (authHeader && authHeader === adminKey) return next()
  // If provided as Bearer token or Bearer ADMIN_KEY allow both
  const token = (authHeader && (authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null))
  if (token && adminKey && token === adminKey) return next()
  if (!token) return res.status(401).json({ error: 'Unauthorized' })
  if (!jwtSecret) return res.status(500).json({ error: 'Server misconfiguration: JWT_SECRET not set' })
  try {
    const payload = jwt.verify(token, jwtSecret)
    // attach user payload into request for later use
    req.user = payload
    return next()
  } catch (e) {
    return res.status(403).json({ error: 'Forbidden' })
  }
}

export function requireAuth(req, res, next) {
  const authHeader = req.headers['authorization']
  if (!authHeader) return res.status(401).json({ error: 'Unauthorized' })
  const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null
  const jwtSecret = process.env.JWT_SECRET
  if (!token) return res.status(401).json({ error: 'Unauthorized' })
  if (!jwtSecret) return res.status(500).json({ error: 'Server misconfiguration: JWT_SECRET not set' })
  try {
    const payload = jwt.verify(token, jwtSecret)
    req.user = payload
    next()
  } catch (e) {
    return res.status(403).json({ error: 'Forbidden' })
  }
}
