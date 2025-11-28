import express from 'express'
import { db } from '../db.js'
import nodemailer from 'nodemailer'

const router = express.Router()

router.post('/book', async (req, res) => {
  const { firstname, email, phone, company, date, time, freelancer } = req.body
  if (!firstname || !email || !date || !time || !phone) return res.status(400).json({ error: 'Missing required fields' })
  // basic email validation
  const emailRe = /^[\w-.]+@[\w-]+\.[\w-.]+$/
  if (!emailRe.test(email)) return res.status(400).json({ error: 'Invalid email' })
  // simple date/time validation
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(time)) return res.status(400).json({ error: 'Invalid date or time' })
  try {
    // check if slot is already booked
    const slotCheck = await db.query('SELECT id FROM bookings WHERE date = $1 AND time = $2 AND (freelancer = $3 OR $3 IS NULL)', [date, time, freelancer || null])
    if (slotCheck.rows.length > 0) return res.status(409).json({ error: 'Slot already taken' })
    const { rows } = await db.query(
      'INSERT INTO bookings (firstname, email, phone, company, freelancer, date, time) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id, firstname, email, phone, company, freelancer, date, time, created_at',
      [firstname, email, phone || null, company || null, freelancer || null, date, time]
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
        const html = `
          <div style="font-family: Arial, sans-serif; color: #111;">
            <h2>Confirmation de réservation</h2>
            <p>Bonjour ${firstname},</p>
            <p>Votre réservation pour <strong>${date} à ${time}</strong> a bien été prise en compte${freelancer ? ' pour ' + freelancer : ''}.</p>
            <p>Merci !</p>
          </div>
        `
        const mailOptions = {
          from: process.env.SMTP_FROM || process.env.SMTP_USER,
          to: email,
          subject: 'Confirmation de réservation',
          text: `Bonjour ${firstname} - votre créneau ${date} ${time} est confirmé.`,
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
    const { rows } = freelancer
      ? await db.query('SELECT id, firstname, email, phone, company, freelancer, date, time, created_at FROM bookings WHERE date = $1 AND freelancer = $2', [date, freelancer])
      : await db.query('SELECT id, firstname, email, phone, company, freelancer, date, time, created_at FROM bookings WHERE date = $1', [date])
    res.json(rows)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

export default router
