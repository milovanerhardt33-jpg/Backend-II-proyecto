import * as eventsDao from '../dao/events.dao.js'

// Capa de repositorio: intermediario entre los services y el DAO.

export const createEvent = async (eventData) => {
  return eventsDao.createEvent(eventData)
}

export const findAllEvents = async () => {
  return eventsDao.findAllEvents()
}

export const findEventById = async (id) => {
  return eventsDao.findEventById(id)
}

export const updateEvent = async (id, updates) => {
  return eventsDao.updateEvent(id, updates)
}

export const deleteEvent = async (id) => {
  return eventsDao.deleteEvent(id)
}
