import { idToString, isPopulated } from './helpers.js'

// Evento completo (GET/POST/PUT/PATCH de eventos).
export class EventDTO {
  constructor(event) {
    this._id = idToString(event._id)
    this.title = event.title
    this.description = event.description
    this.category = event.category
    this.date = event.date
    this.location = event.location
    this.capacity = event.capacity
    this.price = event.price
    this.status = event.status
    // Si algún día se popula el organizador, solo salen sus datos públicos.
    this.organizer = isPopulated(event.organizer)
      ? {
          _id: idToString(event.organizer._id),
          first_name: event.organizer.first_name,
          last_name: event.organizer.last_name
        }
      : idToString(event.organizer)
    this.createdAt = event.createdAt
    this.updatedAt = event.updatedAt
  }

  static list(events) {
    return events.map((event) => new EventDTO(event))
  }
}

// Resumen del evento dentro de un ticket (GET /api/tickets/my-tickets).
export class EventSummaryDTO {
  constructor(event) {
    this._id = idToString(event._id)
    this.title = event.title
    this.date = event.date
    this.location = event.location
  }
}
