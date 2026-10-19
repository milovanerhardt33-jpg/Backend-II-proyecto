import * as eventsRepository from '../repositories/events.repository.js'

// Error de negocio con status HTTP asociado, para que el controller
// solo tenga que mapearlo a la respuesta.
class ServiceError extends Error {
  constructor(status, message) {
    super(message)
    this.status = status
  }
}

export const listEvents = async () => {
  return eventsRepository.findAllEvents()
}

export const createEvent = async ({ title, description, date, location, capacity, organizerId }) => {
  if (!title || !description || !date || !location) {
    throw new ServiceError(400, 'Faltan campos obligatorios')
  }

  // El organizador SIEMPRE sale del usuario autenticado (req.user), nunca
  // del body: nadie puede crear un evento "a nombre de" otra persona.
  return eventsRepository.createEvent({
    title,
    description,
    date,
    location,
    capacity: capacity || 0,
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

export const updateEvent = async ({ eventId, updates, user }) => {
  const event = await eventsRepository.findEventById(eventId)
  assertCanModify(event, user)

  // El organizador de un evento no se reasigna desde acá.
  const { organizer, ...safeUpdates } = updates

  return eventsRepository.updateEvent(eventId, safeUpdates)
}

export const cancelEvent = async ({ eventId, user }) => {
  const event = await eventsRepository.findEventById(eventId)
  assertCanModify(event, user)

  return eventsRepository.deleteEvent(eventId)
}
