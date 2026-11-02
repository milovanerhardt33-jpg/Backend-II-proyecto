import { Router } from 'express'
import {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  updateEventStatus
} from '../controllers/events.controller.js'
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

export default router
