import * as ticketsService from '../services/tickets.service.js'

// Los controllers solo manejan request/response: toda la validación y las
// reglas de negocio viven en services/tickets.service.js.

const handleError = (res, error, fallbackMessage) => {
  const status = error.status || 500
  const message = error.status ? error.message : fallbackMessage
  res.status(status).json({ status: 'error', message })
}

export const createTicket = async (req, res) => {
  try {
    const { ticket, emailSent } = await ticketsService.enroll({
      eventId: req.params.eid,
      userId: req.user.id,
      quantity: req.body?.quantity
    })
    res.status(201).json({ status: 'success', payload: ticket, emailSent })
  } catch (error) {
    handleError(res, error, 'Error al realizar la inscripción')
  }
}

export const getMyTickets = async (req, res) => {
  try {
    const tickets = await ticketsService.listMyTickets(req.user.id)
    res.json({ status: 'success', payload: tickets })
  } catch (error) {
    handleError(res, error, 'Error al obtener tus tickets')
  }
}

export const getEventTickets = async (req, res) => {
  try {
    const tickets = await ticketsService.listEventTickets({
      eventId: req.params.eid,
      user: req.user
    })
    res.json({ status: 'success', payload: tickets })
  } catch (error) {
    handleError(res, error, 'Error al obtener las inscripciones del evento')
  }
}

export const cancelTicket = async (req, res) => {
  try {
    const ticket = await ticketsService.cancelTicket({
      ticketId: req.params.tid,
      user: req.user
    })
    res.json({ status: 'success', payload: ticket })
  } catch (error) {
    handleError(res, error, 'Error al cancelar el ticket')
  }
}
