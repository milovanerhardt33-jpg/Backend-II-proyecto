import * as ticketsRepository from '../repositories/tickets.repository.js'
import * as eventsRepository from '../repositories/events.repository.js'
import * as usersRepository from '../repositories/users.repository.js'
import { sendEnrollmentConfirmation } from './mail.service.js'
import { generateReservationCode } from '../utils/reservation-code.js'

// Error de negocio con status HTTP asociado, para que el controller
// solo tenga que mapearlo a la respuesta.
class ServiceError extends Error {
  constructor(status, message) {
    super(message)
    this.status = status
  }
}

const MAX_CODE_ATTEMPTS = 3

// Busca sin reventar si el id tiene un formato inválido (Mongoose tira
// CastError): se trata igual que "no existe" → 404.
const findEventOrNull = async (eventId) => {
  try {
    return await eventsRepository.findEventById(eventId)
  } catch (error) {
    return null
  }
}

const findTicketOrNull = async (ticketId) => {
  try {
    return await ticketsRepository.findTicketById(ticketId)
  } catch (error) {
    return null
  }
}

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
  const event = await findEventOrNull(eventId)
  if (!event) {
    throw new ServiceError(404, 'Evento no encontrado')
  }

  // Si no se manda quantity, se asume 1 entrada. Si se manda, tiene que ser
  // un número entero mayor a 0 (un string como "2" se rechaza).
  const requested = quantity === undefined ? 1 : quantity
  if (!Number.isInteger(requested) || requested <= 0) {
    throw new ServiceError(400, 'quantity debe ser un número entero mayor a 0')
  }

  if (event.status === 'cancelled') {
    throw new ServiceError(409, 'No te podés inscribir: el evento está cancelado')
  }
  if (event.status === 'finished') {
    throw new ServiceError(409, 'No te podés inscribir: el evento ya finalizó')
  }
  if (event.status !== 'published') {
    throw new ServiceError(409, 'El evento todavía no está publicado')
  }
  if (new Date(event.date).getTime() < Date.now()) {
    throw new ServiceError(409, 'No te podés inscribir: el evento ya finalizó')
  }

  const existing = await ticketsRepository.findActiveTicketByUserAndEvent(userId, event._id)
  if (existing) {
    throw new ServiceError(409, 'Ya tenés una inscripción activa para este evento')
  }

  // Cupos ocupados: solo tickets activos. Los cancelados no ocupan lugar.
  const taken = await ticketsRepository.sumActiveQuantityByEvent(event._id)
  const available = Math.max(event.capacity - taken, 0)
  if (requested > available) {
    throw new ServiceError(
      409,
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
  const user = await usersRepository.findUserById(userId)
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
      return await ticketsRepository.createTicket({
        ...data,
        reservationCode: generateReservationCode()
      })
    } catch (error) {
      if (error.code !== 11000) throw error

      if (error.keyPattern?.reservationCode && attempt < MAX_CODE_ATTEMPTS) {
        continue
      }
      if (error.keyPattern?.user || error.keyPattern?.event) {
        throw new ServiceError(409, 'Ya tenés una inscripción activa para este evento')
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
  return ticketsRepository.findTicketsByUser(userId)
}

// Tickets de un evento: solo el organizer dueño del evento o un admin.
// (El middleware "authorize" ya dejó afuera a los users comunes con 403;
// acá se valida que el organizer sea dueño de ESTE evento.)
export const listEventTickets = async ({ eventId, user }) => {
  const event = await findEventOrNull(eventId)
  if (!event) {
    throw new ServiceError(404, 'Evento no encontrado')
  }

  if (!isOwnerOrAdmin(event.organizer, user)) {
    throw new ServiceError(403, 'No podés ver las inscripciones de un evento que no te pertenece')
  }

  return ticketsRepository.findTicketsByEvent(event._id)
}

// ---------------------------------------------------------------------
// Cancelación
// ---------------------------------------------------------------------

// Cancelar NO borra el ticket: pasa a "cancelled" y guarda cancelledAt.
// El cupo se libera solo, porque los cancelados no se cuentan al calcular
// los ocupados.
export const cancelTicket = async ({ ticketId, user }) => {
  const ticket = await findTicketOrNull(ticketId)
  if (!ticket) {
    throw new ServiceError(404, 'Ticket no encontrado')
  }

  if (!isOwnerOrAdmin(ticket.user, user)) {
    throw new ServiceError(403, 'No podés cancelar un ticket que no es tuyo')
  }

  if (ticket.status === 'cancelled') {
    throw new ServiceError(409, 'El ticket ya está cancelado')
  }

  return ticketsRepository.updateTicket(ticketId, {
    status: 'cancelled',
    cancelledAt: new Date()
  })
}
