import { EventDAO } from '../dao/events.dao.js'

const escapeRegExp = (text) => String(text).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

export class EventRepository {
  constructor(dao = new EventDAO()) {
    this.dao = dao
  }

  create(eventData) {
    return this.dao.create(eventData)
  }

  findById(id) {
    return this.dao.findById(id)
  }

  // Datos editables del evento (título, fecha, cupo, etc.).
  updateDetails(id, updates) {
    return this.dao.update(id, updates)
  }

  // Cambio de estado. Nunca se borra un evento: "cancelar" es un estado más.
  updateStatus(id, status) {
    return this.dao.update(id, { status })
  }

  // Búsqueda de eventos con criterios del dominio. Acá se traducen a la
  // consulta concreta (regex, rangos de fecha), para que el service no sepa
  // cómo se arma un filtro de la base.
  async search({ status, category, location, dateFrom, dateTo, sortField = 'date', sortDirection = 'asc', page = 1, limit = 10 } = {}) {
    const filter = {}

    if (status) filter.status = status
    // category/location son texto libre: match case-insensitive. Se escapa el
    // texto para que caracteres como "(" o "." no se interpreten como regex.
    if (category) filter.category = new RegExp(`^${escapeRegExp(category)}$`, 'i')
    if (location) filter.location = new RegExp(escapeRegExp(location), 'i')

    if (dateFrom || dateTo) {
      filter.date = {}
      if (dateFrom) filter.date.$gte = new Date(dateFrom)
      if (dateTo) filter.date.$lte = new Date(dateTo)
    }

    return this.dao.findPage({
      filter,
      skip: (page - 1) * limit,
      limit,
      sort: { [sortField]: sortDirection === 'desc' ? -1 : 1 }
    })
  }
}

export const eventsRepository = new EventRepository()
