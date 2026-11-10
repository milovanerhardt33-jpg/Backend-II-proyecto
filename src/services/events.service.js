import { eventsRepository } from '../repositories/events.repository.js'
import { EVENT_STATUS_VALUES } from '../constants/event-status.js'
import { BadRequestError, ForbiddenError, NotFoundError } from '../utils/errors.js'

const DEFAULT_PAGE = 1
const DEFAULT_LIMIT = 10
const MAX_LIMIT = 50

// Campos por los que se puede ordenar el listado ("date" por defecto).
const SORTABLE_FIELDS = ['date', 'price', 'title', 'capacity', 'createdAt']

const assertValidStatus = (status) => {
  if (!EVENT_STATUS_VALUES.includes(status)) {
    throw new BadRequestError(`status inválido. Valores permitidos: ${EVENT_STATUS_VALUES.join(', ')}`)
  }
}

const assertValidDateFilter = (name, value) => {
  if (value !== undefined && Number.isNaN(new Date(value).getTime())) {
    throw new BadRequestError(`${name} inválida: usá una fecha como 2027-01-31`)
  }
}

// "date" (asc, default) | "-date" (desc) | "price", "-price", etc.
const parseSort = (sort) => {
  if (!sort || typeof sort !== 'string') return { sortField: 'date', sortDirection: 'asc' }

  const sortDirection = sort.startsWith('-') ? 'desc' : 'asc'
  const field = sort.replace(/^-/, '')
  return { sortField: SORTABLE_FIELDS.includes(field) ? field : 'date', sortDirection }
}

export const listEvents = async (query) => {
  const page = Math.max(parseInt(query.page, 10) || DEFAULT_PAGE, 1)
  const limit = Math.min(Math.max(parseInt(query.limit, 10) || DEFAULT_LIMIT, 1), MAX_LIMIT)

  if (query.status) assertValidStatus(query.status)
  assertValidDateFilter('dateFrom', query.dateFrom)
  assertValidDateFilter('dateTo', query.dateTo)

  const { events, total } = await eventsRepository.search({
    status: query.status,
    category: query.category,
    location: query.location,
    dateFrom: query.dateFrom,
    dateTo: query.dateTo,
    ...parseSort(query.sort),
    page,
    limit
  })

  return {
    data: events,
    page,
    limit,
    total,
    totalPages: Math.max(Math.ceil(total / limit), 1)
  }
}

export const getEventById = async (eventId) => {
  const event = await eventsRepository.findById(eventId)

  if (!event) {
    throw new NotFoundError('Evento no encontrado')
  }

  return event
}

const assertValidCapacityAndPrice = ({ capacity, price }) => {
  if (capacity !== undefined && !(capacity > 0)) {
    throw new BadRequestError('La capacidad debe ser mayor a 0')
  }
  if (price !== undefined && !(price >= 0)) {
    throw new BadRequestError('El precio no puede ser negativo')
  }
}

const assertNotPastDate = (date) => {
  if (!date) return

  const time = new Date(date).getTime()
  if (Number.isNaN(time)) {
    throw new BadRequestError('La fecha del evento es inválida')
  }
  if (time < Date.now()) {
    throw new BadRequestError('La fecha del evento no puede estar en el pasado')
  }
}

export const createEvent = async ({ title, description, category, date, location, capacity, price, organizerId }) => {
  if (!title || !description || !category || !location || date === undefined || capacity === undefined) {
    throw new BadRequestError('Faltan campos obligatorios')
  }

  assertNotPastDate(date)
  assertValidCapacityAndPrice({ capacity, price })

  // El organizador SIEMPRE sale del usuario autenticado, nunca del body:
  // nadie puede crear un evento "a nombre de" otra persona.
  // El status tampoco se toma del body: todo evento nuevo nace "draft".
  return eventsRepository.create({
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
    throw new NotFoundError('Evento no encontrado')
  }

  const isOwner = event.organizer?.toString() === user.id
  const isAdmin = user.role === 'admin'

  // Propiedad del recurso: un organizer solo puede tocar SUS propios
  // eventos. Un admin puede tocar cualquiera.
  if (!isOwner && !isAdmin) {
    throw new ForbiddenError('No podés modificar un evento que no te pertenece')
  }
}

// Decisión documentada: un evento cancelado queda inmutable, sin
// excepciones. Ni el dueño ni un admin pueden volver a tocarlo (si en el
// futuro hiciera falta una excepción puntual, debería ser una acción
// administrativa aparte y auditada, no un update común).
const assertNotCancelled = (event) => {
  if (event.status === 'cancelled') {
    throw new BadRequestError('No se puede modificar un evento cancelado')
  }
}

export const updateEvent = async ({ eventId, updates, user }) => {
  const event = await eventsRepository.findById(eventId)
  assertCanModify(event, user)
  assertNotCancelled(event)

  // organizer y status no se tocan por este endpoint: organizer nunca se
  // reasigna, y el status solo cambia vía PATCH /:id/status.
  const { organizer, status, ...safeUpdates } = updates

  if (safeUpdates.date !== undefined) {
    assertNotPastDate(safeUpdates.date)
  }
  assertValidCapacityAndPrice(safeUpdates)

  return eventsRepository.updateDetails(eventId, safeUpdates)
}

export const updateEventStatus = async ({ eventId, status, user }) => {
  if (!status) {
    throw new BadRequestError(`status inválido. Valores permitidos: ${EVENT_STATUS_VALUES.join(', ')}`)
  }
  assertValidStatus(status)

  const event = await eventsRepository.findById(eventId)
  assertCanModify(event, user)
  assertNotCancelled(event)

  // No tiene sentido "republicar" algo que ya terminó.
  if (status === 'published' && event.status === 'finished') {
    throw new BadRequestError('No se puede publicar un evento ya finalizado')
  }

  return eventsRepository.updateStatus(eventId, status)
}
