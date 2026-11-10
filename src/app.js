import express from 'express'
import cookieParser from 'cookie-parser'
import passport from 'passport'

import { initializePassport } from './config/passport.config.js'
import usersRouter from './routes/users.routes.js'
import sessionsRouter from './routes/sessions.routes.js'
import ticketsRouter from './routes/tickets.routes.js'
import eventsRouter from './routes/events.routes.js'
import { notFoundHandler, errorHandler } from './middlewares/error.middleware.js'

const app = express()

app.use(express.json())
app.use(cookieParser())

// Las estrategias en sí viven en config/passport.config.js, nunca acá.
initializePassport()
app.use(passport.initialize())

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Servidor activo' })
})

app.use('/api/users', usersRouter)
app.use('/api/sessions', sessionsRouter)
app.use('/api/tickets', ticketsRouter)
app.use('/api/events', eventsRouter)

// Siempre al final: rutas inexistentes (404) y manejo central de errores.
app.use(notFoundHandler)
app.use(errorHandler)

export default app
