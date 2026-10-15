import { Router } from 'express'
import { register, login, current, logout } from '../controllers/sessions.controller.js'
import { passportCall } from '../middlewares/passport-call.middleware.js'

const router = Router()

// La validación/registro/login ya la resuelve la estrategia de Passport
// correspondiente; el controller solo responde (y, en login, genera el JWT).
router.post('/register', passportCall('register'), register)
router.post('/login', passportCall('login'), login)
router.get('/current', passportCall('current'), current)
router.post('/logout', logout) // No requiere pasar por Passport

export default router
