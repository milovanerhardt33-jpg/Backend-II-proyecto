import * as eventsService from '../services/events.service.js'

export const getEvents = async (req, res) => {
  try {
    const events = await eventsService.listEvents()
    res.json({ status: 'success', payload: events })
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Error al obtener eventos' })
  }
}

export const createEvent = async (req, res) => {
  try {
    const event = await eventsService.createEvent({
      ...req.body,
      organizerId: req.user.id
    })
    res.status(201).json({ status: 'success', payload: event })
  } catch (error) {
    const status = error.status || 500
    const message = error.status ? error.message : 'Error al crear evento'
    res.status(status).json({ status: 'error', message })
  }
}

export const updateEvent = async (req, res) => {
  try {
    const event = await eventsService.updateEvent({
      eventId: req.params.id,
      updates: req.body,
      user: req.user
    })
    res.json({ status: 'success', payload: event })
  } catch (error) {
    const status = error.status || 500
    const message = error.status ? error.message : 'Error al modificar el evento'
    res.status(status).json({ status: 'error', message })
  }
}

export const cancelEvent = async (req, res) => {
  try {
    await eventsService.cancelEvent({ eventId: req.params.id, user: req.user })
    res.json({ status: 'success', message: 'Evento cancelado' })
  } catch (error) {
    const status = error.status || 500
    const message = error.status ? error.message : 'Error al cancelar el evento'
    res.status(status).json({ status: 'error', message })
  }
}
