const cors = require('cors')
const dotenv = require('dotenv')
const express = require('express')
const rateLimit = require('express-rate-limit')

dotenv.config()

const requiredEnv = ['SUPABASE_URL', 'SUPABASE_SERVICE_KEY', 'JWT_SECRET']
const missingEnv = requiredEnv.filter((key) => !process.env[key])
if (missingEnv.length > 0) {
  console.error(`Missing required environment variables: ${missingEnv.join(', ')}`)
  process.exit(1)
}

const app = express()

app.use(cors())
app.use(express.json())

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
})

app.use(apiLimiter)

const authRoutes = require('./routes/auth')
const usersRoutes = require('./routes/users')
const activitiesRoutes = require('./routes/activities')
const exerciseTypesRoutes = require('./routes/exerciseTypes')

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' })
})

app.use('/auth', authRoutes)
app.use('/users', usersRoutes)
app.use('/activities', activitiesRoutes)
app.use('/exercise-types', exerciseTypesRoutes)

app.use((err, _req, res, _next) => {
  console.error(err)
  res.status(500).json({ error: 'Server error.' })
})

const port = process.env.PORT || 3000
app.listen(port, () => {
  console.log(`Server listening on port ${port}`)
})
