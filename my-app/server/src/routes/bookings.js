import express from 'express'
import { db } from '../db.js'
import { requireAdmin } from '../middlewares/auth.js'
import nodemailer from 'nodemailer'
import crypto from 'crypto'

const router = express.Router()

router.post('/book', async (req, res) => {
  const { firstname, email, phone, company, start_ts, duration_minutes, freelancer } = req.body
  if (!firstname || !email || !start_ts || !duration_minutes || !phone) return res.status(400).json({ error: 'Missing required fields' })
  const emailRe = /^[\w-.]+@[\w-]+\.[\w-.]+$/
  if (!emailRe.test(email)) return res.status(400).json({ error: 'Invalid email' })
  const start = new Date(start_ts)
  if (isNaN(start.getTime())) return res.status(400).json({ error: 'Invalid start_ts' })
  try {
    // check if slot is already booked (overlap) for the same freelancer
    const newStart = start.toISOString()
    const newEnd = new Date(start.getTime() + (duration_minutes * 60 * 1000)).toISOString()
    const overlapQuery = `SELECT id FROM bookings WHERE freelancer = $1 AND (start_ts < $2 AND (start_ts + (duration_minutes || ' minutes')::interval) > $3)`
    const slotCheck = await db.query(overlapQuery, [freelancer || null, newEnd, newStart])
    if (slotCheck.rows.length > 0) return res.status(409).json({ error: 'Slot already taken' })
    const cancelToken = crypto.randomBytes(16).toString('hex')
    const { rows } = await db.query(
      'INSERT INTO bookings (firstname, email, phone, company, freelancer, start_ts, duration_minutes, cancel_token) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id, firstname, email, phone, company, freelancer, start_ts, duration_minutes, created_at, cancel_token',
      [firstname, email, phone || null, company || null, freelancer || null, newStart, duration_minutes, cancelToken]
    )

    // Optionally send a confirmation email (configure SMTP via env vars)
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      try {
        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: Number(process.env.SMTP_PORT) || 587,
          secure: false,
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
        })
        // try to collect freelancer email to notify them too
        let freelancerEmail = null
        if (freelancer) {
          const f = await db.query('SELECT email, name FROM freelancers WHERE id = $1', [freelancer])
          if (f.rows?.[0]) freelancerEmail = f.rows[0].email
        }

        const humanStart = new Date(newStart).toLocaleString()
        const cancelUrl = `${process.env.SERVER_BASE_URL || `http://localhost:${process.env.PORT || 4000}`}/api/bookings/cancel/${rows[0].cancel_token}`
        const html = `
              <div style="font-family: Arial, sans-serif; color: #111;">
                <h2>Confirmation de réservation</h2>
                <p>Bonjour ${firstname},</p>
                <p>Votre réservation pour <strong>${newStart}</strong> (durée ${duration_minutes} min) a bien été prise en compte${freelancer ? ' pour ' + freelancer : ''}.</p>
                <p>Si vous souhaitez annuler, cliquez ici: <a href="${cancelUrl}">Annuler la réservation</a></p>
                <p>Merci !</p>
              </div>
            `
        const recipients = [email]
        if (freelancerEmail) recipients.push(freelancerEmail)
        const mailOptions = {
          from: process.env.SMTP_FROM || process.env.SMTP_USER,
          to: recipients.join(','),
          subject: 'Confirmation de réservation',
          text: `Bonjour ${firstname} - votre créneau ${humanStart} (${duration_minutes} min) est confirmé.`,
          html,
        }
        // Add admin BCC if set
        if (process.env.ADMIN_EMAIL) mailOptions.bcc = process.env.ADMIN_EMAIL
        await transporter.sendMail(mailOptions)
      } catch (e) {
        console.warn('Failed to send email', e.message)
      }
    }

    res.json(rows[0])
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

router.get('/bookings', async (req, res) => {
  const date = req.query.date
  const freelancer = req.query.freelancer
  if (!date) return res.status(400).json({ error: 'date required' })
  try {
    // list bookings in a given day (local date string) by expanding day range
    const dayStart = new Date(date + 'T00:00:00Z').toISOString()
    const dayEnd = new Date(new Date(date + 'T00:00:00Z').getTime() + 24 * 60 * 60 * 1000).toISOString()
    const q = 'SELECT id, firstname, email, phone, company, freelancer, start_ts, duration_minutes, created_at, cancel_token FROM bookings WHERE start_ts >= $1 AND start_ts < $2'
    const { rows } = freelancer
      ? await db.query(q + ' AND freelancer = $3', [dayStart, dayEnd, freelancer])
      : await db.query(q, [dayStart, dayEnd])
    res.json(rows)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// admin listing of bookings
router.get('/admin/bookings', requireAdmin, async (req, res) => {
  try {
    const { rows } = await db.query('SELECT id, firstname, email, phone, company, freelancer, start_ts, duration_minutes, created_at, cancel_token FROM bookings ORDER BY start_ts DESC')
    res.json(rows)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

router.delete('/bookings/:id', requireAdmin, async (req, res) => {
  const id = req.params.id
  try {
    await db.query('DELETE FROM bookings WHERE id = $1', [id])
    res.json({ success: true })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// Cancel booking using a cancellation token - this is intended to be used by the end user
router.get('/bookings/cancel/:token', async (req, res) => {
  const token = req.params.token
  try {
    const { rows } = await db.query('DELETE FROM bookings WHERE cancel_token = $1 RETURNING id', [token])
    if (rows.length === 0) return res.status(404).json({ error: 'Token not found' })
    res.json({ success: true })
  } catch (e) { res.status(500).json({ error: e.message }) }
})

export default router
