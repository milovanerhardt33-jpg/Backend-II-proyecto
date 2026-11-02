import * as eventsService from '../services/events.service.js'

export const getEvents = async (req, res) => {
  try {
    const result = await eventsService.listEvents(req.query)
    res.json({ status: 'success', payload: result })
  } catch (error) {
    const status = error.status || 500
    const message = error.status ? error.message : 'Error al obtener eventos'
    res.status(status).json({ status: 'error', message })
  }
}

export const getEventById = async (req, res) => {
  try {
    const event = await eventsService.getEventById(req.params.id)
    res.json({ status: 'success', payload: event })
  } catch (error) {
    const status = error.status || 500
    const message = error.status ? error.message : 'Error al obtener el evento'
    res.status(status).json({ status: 'error', message })
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

export const updateEventStatus = async (req, res) => {
  try {
    const event = await eventsService.updateEventStatus({
      eventId: req.params.id,
      status: req.body.status,
      user: req.user
    })
    res.json({ status: 'success', payload: event })
  } catch (error) {
    const status = error.status || 500
    const message = error.status ? error.message : 'Error al cambiar el estado del evento'
    res.status(status).json({ status: 'error', message })
  }
}
