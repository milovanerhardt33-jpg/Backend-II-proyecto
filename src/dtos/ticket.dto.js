import { idToString, isPopulated } from './helpers.js'
import { AttendeeDTO } from './user.dto.js'
import { EventSummaryDTO } from './event.dto.js'

// Ticket / inscripción. `user` y `event` son referencias: salen como id, o
// —si vienen populados— filtrados por su propio DTO (el usuario nunca
// expone password ni nada más allá de nombre y email).
export class TicketDTO {
  constructor(ticket) {
    this._id = idToString(ticket._id)
    this.user = isPopulated(ticket.user) ? new AttendeeDTO(ticket.user) : idToString(ticket.user)
    this.event = isPopulated(ticket.event) ? new EventSummaryDTO(ticket.event) : idToString(ticket.event)
    this.status = ticket.status
    this.quantity = ticket.quantity
    this.reservationCode = ticket.reservationCode
    this.cancelledAt = ticket.cancelledAt ?? null
    this.createdAt = ticket.createdAt
    this.updatedAt = ticket.updatedAt
  }

  static list(tickets) {
    return tickets.map((ticket) => new TicketDTO(ticket))
  }
}
