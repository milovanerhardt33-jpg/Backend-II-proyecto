import * as ticketsService from '../services/tickets.service.js'
import { TicketDTO } from '../dtos/ticket.dto.js'

// Solo request/response: toda la validación y las reglas de negocio viven en
// services/tickets.service.js. Los errores los resuelve el middleware central.

export const createTicket = async (req, res) => {
  const { ticket, emailSent } = await ticketsService.enroll({
    eventId: req.params.eid,
    userId: req.user.id,
    quantity: req.body?.quantity
  })
  res.status(201).json({ status: 'success', payload: new TicketDTO(ticket), emailSent })
}

export const getMyTickets = async (req, res) => {
  const tickets = await ticketsService.listMyTickets(req.user.id)
  res.json({ status: 'success', payload: TicketDTO.list(tickets) })
}

export const getEventTickets = async (req, res) => {
  const tickets = await ticketsService.listEventTickets({
    eventId: req.params.eid,
    user: req.user
  })
  res.json({ status: 'success', payload: TicketDTO.list(tickets) })
}

export const cancelTicket = async (req, res) => {
  const ticket = await ticketsService.cancelTicket({
    ticketId: req.params.tid,
    user: req.user
  })
  res.json({ status: 'success', payload: new TicketDTO(ticket) })
}
