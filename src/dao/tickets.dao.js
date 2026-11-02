import mongoose from 'mongoose'
import { TicketModel, ACTIVE_TICKET_STATUSES } from '../models/ticket.model.js'

// Capa de acceso a datos: solo interactúa con Mongoose/MongoDB.
// A propósito NO existe un "deleteTicket": los tickets nunca se borran
// físicamente, solo pasan a status "cancelled".

export const createTicket = async (ticketData) => {
  return TicketModel.create(ticketData)
}

export const findTicketById = async (id) => {
  return TicketModel.findById(id)
}

// Ticket activo (confirmed/pending) de un usuario para un evento, si existe.
export const findActiveTicketByUserAndEvent = async (userId, eventId) => {
  return TicketModel.findOne({
    user: userId,
    event: eventId,
    status: { $in: ACTIVE_TICKET_STATUSES }
  })
}

// Suma de "quantity" de los tickets que ocupan cupo en un evento.
// Los cancelados quedan afuera: por eso al cancelar el cupo se libera solo.
export const sumActiveQuantityByEvent = async (eventId) => {
  // OJO: aggregate() NO castea strings a ObjectId como hace find(). Si
  // matcheáramos contra un string, no encontraría nada y el cupo ocupado
  // daría siempre 0 (se podría sobrevender el evento). Por eso se castea.
  const result = await TicketModel.aggregate([
    {
      $match: {
        event: new mongoose.Types.ObjectId(eventId),
        status: { $in: ACTIVE_TICKET_STATUSES }
      }
    },
    { $group: { _id: null, total: { $sum: '$quantity' } } }
  ])
  return result[0]?.total ?? 0
}

// Tickets de un usuario, con los datos básicos del evento (populate).
export const findTicketsByUser = async (userId) => {
  return TicketModel.find({ user: userId })
    .populate('event', 'title date location')
    .sort({ createdAt: -1 })
}

// Tickets de un evento, con los datos mínimos del asistente (populate).
// Nunca se trae el password ni otros campos del usuario.
export const findTicketsByEvent = async (eventId) => {
  return TicketModel.find({ event: eventId })
    .populate('user', 'first_name last_name email')
    .sort({ createdAt: -1 })
}

export const updateTicket = async (id, updates) => {
  return TicketModel.findByIdAndUpdate(id, updates, { new: true, runValidators: true })
}
