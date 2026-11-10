import { ticketsRepository } from '../repositories/tickets.repository.js'
import { eventsRepository } from '../repositories/events.repository.js'
import { usersRepository } from '../repositories/users.repository.js'
import { sendEnrollmentConfirmation } from './mail.service.js'
import { generateReservationCode } from '../utils/reservation-code.js'
import {
  BadRequestError,
  ConflictError,
  ForbiddenError,
  NotFoundError,
  DuplicateKeyError
} from '../utils/errors.js'

const MAX_CODE_ATTEMPTS = 3

const isOwnerOrAdmin = (ownerId, user) => {
  return user.role === 'admin' || ownerId?.toString() === user.id
}

// ---------------------------------------------------------------------
// Inscripción
// ---------------------------------------------------------------------

// Reglas (todas acá, nunca en el controller ni en la ruta):
//  1. El evento existe                              → 404
//  2. quantity es un entero > 0                     → 400
//  3. El evento está "published" (no draft, ni
//     cancelled, ni finished) y su fecha no pasó    → 409
//  4. El usuario no tiene ya un ticket ACTIVO       → 409
//  5. Hay cupo: capacity - ocupados >= quantity     → 409
//     (ocupados = tickets confirmed/pending; los cancelled NO cuentan)
export const enroll = async ({ eventId, userId, quantity }) => {
  const event = await eventsRepository.findById(eventId)
  if (!event) {
    throw new NotFoundError('Evento no encontrado')
  }

  // Si no se manda quantity, se asume 1 entrada. Si se manda, tiene que ser
  // un número entero mayor a 0 (un string como "2" se rechaza).
  const requested = quantity === undefined ? 1 : quantity
  if (!Number.isInteger(requested) || requested <= 0) {
    throw new BadRequestError('quantity debe ser un número entero mayor a 0')
  }

  if (event.status === 'cancelled') {
    throw new ConflictError('No te podés inscribir: el evento está cancelado')
  }
  if (event.status === 'finished') {
    throw new ConflictError('No te podés inscribir: el evento ya finalizó')
  }
  if (event.status !== 'published') {
    throw new ConflictError('El evento todavía no está publicado')
  }
  if (new Date(event.date).getTime() < Date.now()) {
    throw new ConflictError('No te podés inscribir: el evento ya finalizó')
  }

  const existing = await ticketsRepository.findActiveByUserAndEvent(userId, event._id)
  if (existing) {
    throw new ConflictError('Ya tenés una inscripción activa para este evento')
  }

  // Cupos ocupados: solo tickets activos. Los cancelados no ocupan lugar.
  const taken = await ticketsRepository.countActiveSeatsByEvent(event._id)
  const available = Math.max(event.capacity - taken, 0)
  if (requested > available) {
    throw new ConflictError(
      available === 0
        ? 'No hay cupos disponibles para este evento'
        : `No hay cupos suficientes: quedan ${available} y pediste ${requested}`
    )
  }

  const ticket = await createTicketWithUniqueCode({
    user: userId,
    event: event._id,
    quantity: requested,
    status: 'confirmed'
  })

  // El mail es "best effort": si falla, la inscripción ya está hecha.
  const user = await usersRepository.findById(userId)
  const emailSent = user
    ? await sendEnrollmentConfirmation({
        to: user.email,
        firstName: user.first_name,
        event,
        ticket
      })
    : false

  return { ticket, emailSent }
}

// Crea el ticket con un código de reserva único. Si por mala suerte el
// código ya existe (índice único), reintenta con otro. Si el choque es por
// el índice user+event (dos requests simultáneos del mismo usuario), es un
// duplicado: se informa como tal.
const createTicketWithUniqueCode = async (data) => {
  for (let attempt = 1; attempt <= MAX_CODE_ATTEMPTS; attempt++) {
    try {
      return await ticketsRepository.create({
        ...data,
        reservationCode: generateReservationCode()
      })
    } catch (error) {
      if (!(error instanceof DuplicateKeyError)) throw error

      if (error.fields.includes('reservationCode') && attempt < MAX_CODE_ATTEMPTS) {
        continue
      }
      if (error.fields.includes('user') || error.fields.includes('event')) {
        throw new ConflictError('Ya tenés una inscripción activa para este evento')
      }
      throw error
    }
  }
}

// ---------------------------------------------------------------------
// Consultas
// ---------------------------------------------------------------------

// Solo los tickets del usuario autenticado, con title/date/location del evento.
export const listMyTickets = async (userId) => {
  return ticketsRepository.findByUser(userId)
}

// Tickets de un evento: solo el organizer dueño del evento o un admin.
// (El middleware "authorize" ya dejó afuera a los users comunes con 403;
// acá se valida que el organizer sea dueño de ESTE evento.)
export const listEventTickets = async ({ eventId, user }) => {
  const event = await eventsRepository.findById(eventId)
  if (!event) {
    throw new NotFoundError('Evento no encontrado')
  }

  if (!isOwnerOrAdmin(event.organizer, user)) {
    throw new ForbiddenError('No podés ver las inscripciones de un evento que no te pertenece')
  }

  return ticketsRepository.findByEvent(event._id)
}

// ---------------------------------------------------------------------
// Cancelación
// ---------------------------------------------------------------------

// Cancelar NO borra el ticket: pasa a "cancelled" y guarda cancelledAt.
// El cupo se libera solo, porque los cancelados no se cuentan al calcular
// los ocupados.
export const cancelTicket = async ({ ticketId, user }) => {
  const ticket = await ticketsRepository.findById(ticketId)
  if (!ticket) {
    throw new NotFoundError('Ticket no encontrado')
  }

  if (!isOwnerOrAdmin(ticket.user, user)) {
    throw new ForbiddenError('No podés cancelar un ticket que no es tuyo')
  }

  if (ticket.status === 'cancelled') {
    throw new ConflictError('El ticket ya está cancelado')
  }

  return ticketsRepository.cancelTicket(ticketId)
}
