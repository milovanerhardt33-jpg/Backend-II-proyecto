import { Router } from 'express'
import { getEvents, createEvent, updateEvent, cancelEvent } from '../controllers/events.controller.js'
import { auth } from '../middlewares/auth.middleware.js'
import { authorize } from '../middlewares/authorize.middleware.js'

const router = Router()

// Pública: consultar eventos no requiere sesión.
router.get('/', getEvents)

// Crear eventos: requiere sesión (401) y rol organizer o admin (403 para user).
router.post('/', auth, authorize(['organizer', 'admin']), createEvent)

// Modificar / cancelar: requiere sesión + rol organizer o admin.
// La propiedad del recurso (solo el dueño, o cualquiera si es admin) se
// valida dentro del service, no acá.
router.put('/:id', auth, authorize(['organizer', 'admin']), updateEvent)
router.delete('/:id', auth, authorize(['organizer', 'admin']), cancelEvent)

export default router
