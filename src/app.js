import express from 'express'
import cookieParser from 'cookie-parser'
import passport from 'passport'

import { connectDB } from './config/database.js'
import { initializePassport } from './config/passport.config.js'
// import usersRouter from './routes/users.routes.js'
import sessionsRouter from './routes/sessions.routes.js'
// import ticketsRouter from './routes/tickets.routes.js'
import eventsRouter from './routes/events.routes.js'

const app = express()

app.use(express.json())
app.use(cookieParser())

// Las estrategias en sí viven en config/passport.config.js, nunca acá.
initializePassport()
app.use(passport.initialize())

connectDB()

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Servidor activo' })
})

// app.use('/api/users', usersRouter)
app.use('/api/sessions', sessionsRouter)
// app.use('/api/tickets', ticketsRouter)
app.use('/api/events', eventsRouter)

export default app
