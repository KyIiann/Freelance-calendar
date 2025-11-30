import express from 'express'
import cors from 'cors'
import bookingsRouter from './src/routes/bookings.js'
import freelancersRouter from './src/routes/freelancers.js'
import adminRouter from './src/routes/admin.js'
import authRouter from './src/routes/auth.js'
import dotenv from 'dotenv'

dotenv.config()

const app = express()
app.use(cors())
app.use(express.json())

app.use('/api', bookingsRouter)
app.use('/api/freelancers', freelancersRouter)
app.use('/api/admin', adminRouter)
app.use('/api/auth', authRouter)

app.use('/uploads', express.static('public/uploads'))

const PORT = process.env.PORT || 4000
app.listen(PORT, () => console.log(`API running on port ${PORT}`))
