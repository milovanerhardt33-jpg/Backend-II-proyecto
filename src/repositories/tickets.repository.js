import { TicketDAO } from '../dao/tickets.dao.js'

export class TicketRepository {
  constructor(dao = new TicketDAO()) {
    this.dao = dao
  }

  create(ticketData) {
    return this.dao.create(ticketData)
  }

  findById(id) {
    return this.dao.findById(id)
  }

  // Inscripción vigente (confirmed/pending) de un usuario a un evento.
  findActiveByUserAndEvent(userId, eventId) {
    return this.dao.findActiveByUserAndEvent(userId, eventId)
  }

  // Cupos ocupados de un evento: suma de "quantity" de los tickets activos
  // (cuenta lugares, no documentos: un ticket puede reservar varios).
  countActiveSeatsByEvent(eventId) {
    return this.dao.sumActiveQuantityByEvent(eventId)
  }

  findByUser(userId) {
    return this.dao.findByUser(userId)
  }

  findByEvent(eventId) {
    return this.dao.findByEvent(eventId)
  }

  // Cancelar NO borra: marca el ticket como cancelado y registra cuándo.
  cancelTicket(ticketId) {
    return this.dao.update(ticketId, { status: 'cancelled', cancelledAt: new Date() })
  }
}

export const ticketsRepository = new TicketRepository()
