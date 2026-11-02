import * as ticketsDao from '../dao/tickets.dao.js'

// Capa de repositorio: intermediario entre los services y el DAO.

export const createTicket = async (ticketData) => {
  return ticketsDao.createTicket(ticketData)
}

export const findTicketById = async (id) => {
  return ticketsDao.findTicketById(id)
}

export const findActiveTicketByUserAndEvent = async (userId, eventId) => {
  return ticketsDao.findActiveTicketByUserAndEvent(userId, eventId)
}

export const sumActiveQuantityByEvent = async (eventId) => {
  return ticketsDao.sumActiveQuantityByEvent(eventId)
}

export const findTicketsByUser = async (userId) => {
  return ticketsDao.findTicketsByUser(userId)
}

export const findTicketsByEvent = async (eventId) => {
  return ticketsDao.findTicketsByEvent(eventId)
}

export const updateTicket = async (id, updates) => {
  return ticketsDao.updateTicket(id, updates)
}
