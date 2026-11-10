import mongoose from 'mongoose'
import { BaseDAO } from './base.dao.js'
import { TicketModel } from '../models/ticket.model.js'
import { ACTIVE_TICKET_STATUSES } from '../constants/ticket-status.js'

export class TicketDAO extends BaseDAO {
  constructor() {
    super(TicketModel)
  }

  // Ticket activo (confirmed/pending) de un usuario para un evento, si existe.
  async findActiveByUserAndEvent(userId, eventId) {
    return this.findOne({
      user: userId,
      event: eventId,
      status: { $in: ACTIVE_TICKET_STATUSES }
    })
  }

  // Suma de "quantity" de los tickets que ocupan cupo en un evento.
  // Los cancelados quedan afuera: por eso al cancelar el cupo se libera solo.
  async sumActiveQuantityByEvent(eventId) {
    // OJO: aggregate() NO castea strings a ObjectId como hace find(). Si
    // matcheáramos contra un string, no encontraría nada y el cupo ocupado
    // daría siempre 0 (se podría sobrevender el evento). Por eso se castea.
    const result = await this.model.aggregate([
      {
        $match: {
          event: new mongoose.Types.ObjectId(String(eventId)),
          status: { $in: ACTIVE_TICKET_STATUSES }
        }
      },
      { $group: { _id: null, total: { $sum: '$quantity' } } }
    ])
    return result[0]?.total ?? 0
  }

  // Tickets de un usuario, con los datos básicos del evento (populate).
  async findByUser(userId) {
    return this.model
      .find({ user: userId })
      .populate('event', 'title date location')
      .sort({ createdAt: -1 })
      .lean()
  }

  // Tickets de un evento, con los datos mínimos del asistente (populate).
  // Nunca se trae el password ni otros campos del usuario.
  async findByEvent(eventId) {
    return this.model
      .find({ event: eventId })
      .populate('user', 'first_name last_name email')
      .sort({ createdAt: -1 })
      .lean()
  }
}
