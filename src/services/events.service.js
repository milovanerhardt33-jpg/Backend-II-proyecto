import * as eventsRepository from '../repositories/events.repository.js'
import { EVENT_STATUS_VALUES } from '../models/event.model.js'

// Error de negocio con status HTTP asociado, para que el controller
// solo tenga que mapearlo a la respuesta.
class ServiceError extends Error {
  constructor(status, message) {
    super(message)
    this.status = status
  }
}

const DEFAULT_PAGE = 1
const DEFAULT_LIMIT = 10
const MAX_LIMIT = 50

// Busca un evento por id sin reventar si el id tiene un formato inválido
// (Mongoose tira CastError en ese caso): lo tratamos igual que "no existe".
const findEventOrNull = async (eventId) => {
  try {
    return await eventsRepository.findEventById(eventId)
  } catch (error) {
    return null
  }
}

const buildFilter = ({ status, category, location, dateFrom, dateTo }) => {
  const filter = {}

  if (status) {
    if (!EVENT_STATUS_VALUES.includes(status)) {
      throw new ServiceError(400, `status inválido. Valores permitidos: ${EVENT_STATUS_VALUES.join(', ')}`)
    }
    filter.status = status
  }

  // category/location son texto libre: match case-insensitive.
  if (category) {
    filter.category = new RegExp(`^${category}$`, 'i')
  }

  if (location) {
    filter.location = new RegExp(location, 'i')
  }

  if (dateFrom || dateTo) {
    filter.date = {}
    if (dateFrom) filter.date.$gte = new Date(dateFrom)
    if (dateTo) filter.date.$lte = new Date(dateTo)
  }

  return filter
}

// "date" (asc, default) | "-date" (desc) | "price", "-price", etc.
const buildSort = (sort) => {
  if (!sort) return { date: 1 }

  const direction = sort.startsWith('-') ? -1 : 1
  const field = sort.replace(/^-/, '')
  return { [field]: direction }
}

export const listEvents = async (query) => {
  const page = Math.max(parseInt(query.page, 10) || DEFAULT_PAGE, 1)
  const limit = Math.min(Math.max(parseInt(query.limit, 10) || DEFAULT_LIMIT, 1), MAX_LIMIT)
  const skip = (page - 1) * limit

  const filter = buildFilter(query)
  const sort = buildSort(query.sort)

  const { events, total } = await eventsRepository.findEvents({ filter, skip, limit, sort })

  return {
    data: events,
    page,
    limit,
    total,
    totalPages: Math.max(Math.ceil(total / limit), 1)
  }
}

export const getEventById = async (eventId) => {
  const event = await findEventOrNull(eventId)

  if (!event) {
    throw new ServiceError(404, 'Evento no encontrado')
  }

  return event
}

const assertValidCapacityAndPrice = ({ capacity, price }) => {
  if (capacity !== undefined && capacity <= 0) {
    throw new ServiceError(400, 'La capacidad debe ser mayor a 0')
  }
  if (price !== undefined && price < 0) {
    throw new ServiceError(400, 'El precio no puede ser negativo')
  }
}

const assertNotPastDate = (date) => {
  if (date && new Date(date).getTime() < Date.now()) {
    throw new ServiceError(400, 'La fecha del evento no puede estar en el pasado')
  }
}

export const createEvent = async ({ title, description, category, date, location, capacity, price, organizerId }) => {
  if (!title || !description || !category || !location || date === undefined || capacity === undefined) {
    throw new ServiceError(400, 'Faltan campos obligatorios')
  }

  assertNotPastDate(date)
  assertValidCapacityAndPrice({ capacity, price })

  // El organizador SIEMPRE sale del usuario autenticado (req.user), nunca
  // del body: nadie puede crear un evento "a nombre de" otra persona.
  // El status tampoco se toma del body: todo evento nuevo nace "draft".
  return eventsRepository.createEvent({
    title,
    description,
    category,
    date,
    location,
    capacity,
    price: price ?? 0,
    organizer: organizerId
  })
}

const assertCanModify = (event, user) => {
  if (!event) {
    throw new ServiceError(404, 'Evento no encontrado')
  }

  const isOwner = event.organizer?.toString() === user.id
  const isAdmin = user.role === 'admin'

  // Propiedad del recurso: un organizer solo puede tocar SUS propios
  // eventos. Un admin puede tocar cualquiera.
  if (!isOwner && !isAdmin) {
    throw new ServiceError(403, 'No podés modificar un evento que no te pertenece')
  }
}

// Decisión documentada: un evento cancelado queda inmutable, sin
// excepciones. Ni el dueño ni un admin pueden volver a tocarlo (si en el
// futuro hiciera falta una excepción puntual, debería ser una acción
// administrativa aparte y auditada, no un update común).
const assertNotCancelled = (event) => {
  if (event.status === 'cancelled') {
    throw new ServiceError(400, 'No se puede modificar un evento cancelado')
  }
}

export const updateEvent = async ({ eventId, updates, user }) => {
  const event = await findEventOrNull(eventId)
  assertCanModify(event, user)
  assertNotCancelled(event)

  // organizer y status no se tocan por este endpoint: organizer nunca se
  // reasigna, y el status solo cambia vía PATCH /:id/status.
  const { organizer, status, ...safeUpdates } = updates

  if (safeUpdates.date !== undefined) {
    assertNotPastDate(safeUpdates.date)
  }
  assertValidCapacityAndPrice(safeUpdates)

  return eventsRepository.updateEvent(eventId, safeUpdates)
}

export const updateEventStatus = async ({ eventId, status, user }) => {
  if (!status || !EVENT_STATUS_VALUES.includes(status)) {
    throw new ServiceError(400, `status inválido. Valores permitidos: ${EVENT_STATUS_VALUES.join(', ')}`)
  }

  const event = await findEventOrNull(eventId)
  assertCanModify(event, user)
  assertNotCancelled(event)

  // No tiene sentido "republicar" algo que ya terminó.
  if (status === 'published' && event.status === 'finished') {
    throw new ServiceError(400, 'No se puede publicar un evento ya finalizado')
  }

  return eventsRepository.updateEvent(eventId, { status })
}
