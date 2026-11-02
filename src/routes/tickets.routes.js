import { Router } from 'express'
import { getMyTickets, cancelTicket } from '../controllers/tickets.controller.js'
import { auth } from '../middlewares/auth.middleware.js'

const router = Router()

// Montado en /api/tickets. Ambas requieren sesión (401 si no hay).

// Tickets del usuario autenticado (solo los propios).
router.get('/my-tickets', auth, getMyTickets)

// Cancelar un ticket: el dueño del ticket o un admin. La propiedad se
// valida en el service.
router.patch('/:tid/cancel', auth, cancelTicket)

export default router
