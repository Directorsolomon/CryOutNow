import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import swaggerUi from 'swagger-ui-express'
import { authRouter } from './routes/auth.routes'
import { prayerRouter } from './routes/prayer.routes'
import prayerChainRouter from './routes/prayerChainRoutes'
import { errorHandler } from './middleware/error.middleware'
import { swaggerSpec } from './config/swagger'

const app = express()

// Middleware
app.use(helmet())
app.use(cors())
app.use(express.json())

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
})
app.use(limiter)

// Swagger Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))
app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json')
  res.send(swaggerSpec)
})

// Routes
app.use('/api/auth', authRouter)
app.use('/api/prayers', prayerRouter)
app.use('/api/prayer-chains', prayerChainRouter)

// Error handling
app.use(errorHandler)

export default app 