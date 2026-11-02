import { Router } from 'express'
import {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  updateEventStatus
} from '../controllers/events.controller.js'
import { createTicket, getEventTickets } from '../controllers/tickets.controller.js'
import { auth } from '../middlewares/auth.middleware.js'
import { authorize } from '../middlewares/authorize.middleware.js'

const router = Router()

// Públicas: consultar eventos no requiere sesión.
router.get('/', getEvents)
router.get('/:id', getEventById)

// Crear eventos: requiere sesión (401) y rol organizer o admin (403 para user).
router.post('/', auth, authorize(['organizer', 'admin']), createEvent)

// Modificar: requiere sesión + rol organizer/admin. La propiedad del
// recurso (solo el dueño, o cualquiera si es admin) y las reglas de
// negocio (evento cancelado, fechas, etc.) se validan en el service.
router.put('/:id', auth, authorize(['organizer', 'admin']), updateEvent)

// Cambiar de estado (incluye "cancelar"): NUNCA se borra el evento.
router.patch('/:id/status', auth, authorize(['organizer', 'admin']), updateEventStatus)

// Inscripción a un evento: cualquier usuario autenticado (401 sin sesión).
// Todas las validaciones (evento publicado, cupos, duplicados) viven en el service.
router.post('/:eid/tickets', auth, createTicket)

// Ver las inscripciones de un evento: requiere rol organizer/admin (403 para
// un user común) y además ser el dueño de ESE evento, o admin (lo valida el service).
router.get('/:eid/tickets', auth, authorize(['organizer', 'admin']), getEventTickets)

export default router
